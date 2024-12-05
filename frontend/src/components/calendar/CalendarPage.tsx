"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import NavBar from "../Navigation/NavBar";
import styles from "./CalendarPage.module.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/UserContext";
import { useAllEvents } from "@/hooks/use-all-events";
import { useUsersByUserIds } from "@/hooks/use-users-by-user-ids";
import AddEvent from "./AddEvent";
import { PetEvent, User } from "@/share/type";
import { useGetAllVetsOfAPetByPetId } from "@/hooks/use-get-all-vets-of-a-pet-by-pet-id";
import { useCreateNewEvent } from "@/hooks/use-create-new-event";

const localizer = momentLocalizer(moment);

interface Event {
  title: string;
  start: Date;
  end: Date;
  duration?: number;
  location?: string;
  createdBy?: string;
  vetAssigned?: string;
  type?: string;
  status?: string;
  description?: string;
  followUp?: string;
  isEditing?: boolean;
}

const CalendarPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user !== null) {
      return;
    }
    router.push("/login");
  }, [user, router]);

  const { allEvents, status: eventsStatus } = useAllEvents();
  const [events, setEvents] = useState<Event[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (allEvents) {
      const ids = Array.from(
        new Set(
          allEvents.flatMap((event) =>
            [event.CreatedBy, event.VetAssigned].filter(Boolean),
          ),
        ),
      );
      const uniqueIds = Array.from(new Set(ids));
      setUserIds(uniqueIds);
    }
  }, [allEvents]);

  const { users, status: usersStatus } = useUsersByUserIds(userIds);

  const memoizedEvents = useMemo(() => {
    if (!allEvents || usersStatus !== "success" || eventsStatus !== "success") {
      return [];
    }

    return allEvents.map((event) => ({
      title: event.Name,
      start: new Date(event.DateTime),
      end: new Date(
        new Date(event.DateTime).getTime() + event.Duration * 60 * 1000,
      ),
      duration: event.Duration,
      location: event.Location,
      createdBy:
        users[event.CreatedBy]?.FName + " " + users[event.CreatedBy]?.LName,
      vetAssigned:
        users[event.VetAssigned]?.FName + " " + users[event.VetAssigned]?.LName,
      type: event.Type,
      status: event.Status,
      description: event.Description,
      followUp: event.FollowUp,
    }));
  }, [allEvents, usersStatus, eventsStatus]);

  useEffect(() => {
    setEvents(memoizedEvents);
  }, [memoizedEvents]);

  const [possibleVets, setPossibleVets] = useState<Record<string, User>>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("month");
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState(
    moment(new Date()).format("YYYY-MM-DD"),
  );
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");
  const [newEventDuration, setNewEventDuration] = useState(0);
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventPetAssigned, setNewEventPetAssigned] = useState("");
  const [newEventVetAssigned, setNewEventVetAssigned] = useState("");
  const [newEventType, setNewEventType] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventFollowUp, setNewEventFollowUp] = useState("");
  const [selectedChecklistEvent, setSelectedChecklistEvent] =
    useState<Event | null>(null);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);

  useEffect(() => {
    if (currentView === "day") {
      setNewEventDate(moment(currentDate).format("YYYY-MM-DD"));
    } else if (currentView === "month" || currentView === "week") {
      setNewEventDate(moment(new Date()).format("YYYY-MM-DD")); // Default to today
    }
  }, [currentView, currentDate]);

  const { vetAssigneds, status } =
    useGetAllVetsOfAPetByPetId(newEventPetAssigned);
  useEffect(() => {
    if (status === "success") {
      setPossibleVets(vetAssigneds);
    }
  }, [status, vetAssigneds]);

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setCurrentDate(start); // Navigate to the clicked date
    setCurrentView("day"); // Switch to day view
  };

  const handleCardClick = (event: Event) => {
    setSelectedChecklistEvent(event);
    setIsChecklistModalOpen(true);
  };

  const closeModal = () => {
    setIsChecklistModalOpen(false);
    setSelectedChecklistEvent(null);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setNewEventTitle(event.title); // Pre-fill the title in the modal
    setNewEventDate(moment(event.start).format("YYYY-MM-DD"));
    setNewEventStartTime(moment(event.start).format("HH:mm"));
    setNewEventEndTime(moment(event.end).format("HH:mm"));
    setEditModalOpen(true); // Open the modal for event details
  };

  // const handleSaveEvent = () => {
  //   if (
  //     !newEventTitle ||
  //     !newEventStartTime ||
  //     !newEventEndTime ||
  //     !newEventDate
  //   ) {
  //     alert("Please fill in all fields.");
  //     return;
  //   }

  //   const [startHour, startMinute] = newEventStartTime.split(":").map(Number);
  //   const [endHour, endMinute] = newEventEndTime.split(":").map(Number);
  //   const startDate = new Date(newEventDate);
  //   const endDate = new Date(newEventDate);

  //   startDate.setHours(startHour, startMinute);
  //   endDate.setHours(endHour, endMinute);

  //   if (endDate <= startDate) {
  //     alert("End time must be after start time.");
  //     return;
  //   }

  //   setEvents([
  //     ...events,
  //     {
  //       title: newEventTitle,
  //       start: startDate,
  //       end: endDate,
  //     },
  //   ]);

  //   // Reset the form and close the modal
  //   setNewEventTitle("");
  //   setNewEventDate(moment(new Date()).format("YYYY-MM-DD"));
  //   setNewEventStartTime("");
  //   setNewEventEndTime("");
  //   setNewEventDuration(0);
  //   setNewEventLocation("");
  //   setNewEventPetAssigned("");
  //   setNewEventVetAssigned("");
  //   setNewEventType("");
  //   setNewEventDescription("");
  //   setNewEventFollowUp("");
  //   setModalOpen(false);
  // };

  const createNewEventMutation = useCreateNewEvent();

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newEventTitle ||
      !newEventDate ||
      !newEventDuration ||
      !newEventLocation ||
      !newEventVetAssigned ||
      !newEventType ||
      !newEventDescription ||
      !newEventFollowUp ||
      !newEventPetAssigned
    ) {
      alert("Please fill in all fields.");
      return;
    }
    const startDate = new Date(newEventDate);
    const newEvent: PetEvent = {
      Name: newEventTitle,
      DateTime: startDate.toISOString(),
      Duration: newEventDuration,
      Location: newEventLocation,
      CreatedAt: new Date().toISOString(),
      CreatedBy: user?.Id || "",
      VetAssigned: newEventVetAssigned,
      Type: newEventType,
      Description: newEventDescription,
      FollowUp: newEventFollowUp,
    };

    createNewEventMutation.mutate(
      { petId: newEventPetAssigned, newEvent },
      {
        onSuccess: () => {
          resetForm();
          setModalOpen(false);
        },
        onError: (error: any) => {
          alert(`Error creating event: ${error.message}`);
        },
      },
    );
  };

  const resetForm = () => {
    setNewEventTitle("");
    setNewEventDate(moment(new Date()).format("YYYY-MM-DDTHH:mm"));
    setNewEventDuration(0);
    setNewEventLocation("");
    setNewEventPetAssigned("");
    setNewEventVetAssigned("");
    setNewEventType("");
    setNewEventDescription("");
    setNewEventFollowUp("");
  };

  const handleDeleteEvent = () => {
    setEvents(events.filter((event) => event !== selectedEvent));
    setEditModalOpen(false);
  };

  const handleEditEvent = () => {
    if (!selectedEvent) return;

    const updatedEvents = events.map((event) =>
      event === selectedEvent
        ? {
            ...event,
            title: newEventTitle || event.title,
            start: new Date(newEventDate + "T" + newEventStartTime),
            end: new Date(newEventDate + "T" + newEventEndTime),
          }
        : event,
    );

    setEvents(updatedEvents);
    setEditModalOpen(false);
  };

  return (
    <div className={styles["container"]}>
      {/* Navigation Bar */}
      <div className={styles["nav-container"]}>
        <NavBar />
      </div>

      {/* Main Content */}
      <div className={styles["content"]}>
        {/* Calendar Section */}
        <div className={styles["calendar-section"]}>
          <h1 className={styles["header"]}>My Calendar</h1>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleEventClick}
            views={["month", "week", "day"]}
            defaultView="month"
            defaultDate={new Date()}
            date={currentDate}
            view={currentView}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            className={styles["calendar"]}
          />
        </div>

        {/* Checklist Section */}
        <div className={styles["checklist-section"]}>
          <h3 className={styles["checklist-header"]}>Monthly Checklist</h3>
          <div className={styles["checklist"]}>
            {events.map((event, index) => (
              <div
                key={index}
                className={styles["card"]}
                onClick={() => handleCardClick(event)}
              >
                <h4 className={styles["card-title"]}>{event.title}</h4>
                <p className={styles["card-date"]}>
                  {moment(event.start).format("YYYY-MM-DD HH:mm")}
                </p>
                <p className={styles["card-location"]}>{event.location}</p>
              </div>
            ))}
          </div>
          {user && user.Role === "Vet" && (
            <button
              onClick={() => setModalOpen(true)}
              className={styles["add-button"]}
            >
              Add Event
            </button>
          )}
          {isChecklistModalOpen && selectedChecklistEvent && (
            <div className={styles["modal-overlay"]} onClick={closeModal}>
              <div
                className={styles["modal"]}
                onClick={(e) => e.stopPropagation()}
              >
                <button className={styles["close-button"]} onClick={closeModal}>
                  ✖
                </button>
                <h2 className={styles["modal-heading"]}>
                  {selectedChecklistEvent.title}
                </h2>
                <div className={styles["modal-content"]}>
                  <p>
                    <strong>Start:</strong>{" "}
                    {moment(selectedChecklistEvent.start).format(
                      "YYYY-MM-DD HH:mm",
                    )}
                  </p>
                  <p>
                    <strong>End:</strong>{" "}
                    {moment(selectedChecklistEvent.end).format(
                      "YYYY-MM-DD HH:mm",
                    )}
                  </p>
                  <p>
                    <strong>Duration:</strong> {selectedChecklistEvent.duration}{" "}
                    minutes
                  </p>
                  <p>
                    <strong>Location:</strong> {selectedChecklistEvent.location}
                  </p>
                  <p>
                    <strong>Created By:</strong>{" "}
                    {selectedChecklistEvent.createdBy}
                  </p>
                  <p>
                    <strong>Vet Assigned:</strong>{" "}
                    {selectedChecklistEvent.vetAssigned}
                  </p>
                  {selectedChecklistEvent.type && (
                    <p>
                      <strong>Type:</strong> {selectedChecklistEvent.type}
                    </p>
                  )}
                  {selectedChecklistEvent.status && (
                    <p>
                      <strong>Status:</strong> {selectedChecklistEvent.status}
                    </p>
                  )}
                  {selectedChecklistEvent.description && (
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedChecklistEvent.description}
                    </p>
                  )}
                  {selectedChecklistEvent.followUp && (
                    <p>
                      <strong>Follow Up:</strong>{" "}
                      {selectedChecklistEvent.followUp}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Adding New Event */}
      {modalOpen && (
        <div className={styles["modal-overlay"]}>
          <div className={styles["modal"]}>
            <button
              className={styles["close-button"]}
              onClick={() => setModalOpen(false)}
            >
              ✖
            </button>
            <h2 className={styles["modal-heading"]}>Add Event</h2>
            <form className={styles["modal-form"]}>
              <div className={styles["form-sections"]}>
                <div className={styles["form-section"]}>
                  <div className={styles["form-group"]}>
                    <label htmlFor="eventName">Event Name:</label>
                    <input
                      id="eventName"
                      type="text"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      className={styles["input"]}
                    />
                  </div>
                  <div className={styles["form-group"]}>
                    <label htmlFor="eventDate">Date:</label>
                    <input
                      id="eventDate"
                      type="datetime-local"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className={styles["input"]}
                    />
                  </div>
                  <AddEvent
                    newEventPetAssigned={newEventPetAssigned}
                    setNewEventPetAssigned={setNewEventPetAssigned}
                  />
                </div>

                <div className={styles["vertical-divider"]}></div>

                <div className={styles["form-section"]}>
                  <div className={styles["form-group"]}>
                    <label htmlFor="duration">Duration (minutes):</label>
                    <input
                      id="duration"
                      type="number"
                      value={newEventDuration}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value > 0) {
                          setNewEventDuration(value);
                        }
                      }}
                      className={styles["input"]}
                    />
                  </div>
                  <div className={styles["form-group"]}>
                    <label htmlFor="location">Location:</label>
                    <input
                      id="location"
                      type="text"
                      value={newEventLocation}
                      onChange={(e) => setNewEventLocation(e.target.value)}
                      className={styles["input"]}
                    />
                  </div>
                  <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                      <label htmlFor="vetSelect">Vet Assignment:</label>
                      <select
                        id="vetSelect"
                        className={styles["input"]}
                        value={newEventVetAssigned}
                        onChange={(e) => setNewEventVetAssigned(e.target.value)}
                      >
                        <option value="" disabled hidden>
                          Select Vet
                        </option>
                        {possibleVets &&
                          Object.keys(possibleVets).length > 0 &&
                          Object.entries(possibleVets).map(
                            ([vetId, vetRecord]) => (
                              <option key={vetId} value={vetId}>
                                {vetRecord.FName} {vetRecord.LName}
                              </option>
                            ),
                          )}
                      </select>
                    </div>
                    <div className={styles["form-group"]}>
                      <label htmlFor="eventType">Type of Event:</label>
                      <select
                        id="eventType"
                        value={newEventType}
                        onChange={(e) => setNewEventType(e.target.value)}
                        className={styles["input"]}
                      >
                        <option value="" disabled hidden>
                          Select Type of Event
                        </option>
                        <option value="appointment">Appointment</option>
                        <option value="routine_checkup">Routine Checkup</option>
                        <option value="surgery">Surgery</option>
                        <option value="vaccination">Vaccination</option>
                        <option value="emergency_visit">Emergency Visit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles["form-group"]}>
                    <label htmlFor="description">Description:</label>
                    <textarea
                      id="description"
                      value={newEventDescription}
                      onChange={(e) => setNewEventDescription(e.target.value)}
                      className={styles["input"]}
                      rows={2}
                    ></textarea>
                  </div>
                  <div className={styles["form-group"]}>
                    <label htmlFor="followUp">Follow Up:</label>
                    <input
                      id="followUp"
                      type="text"
                      value={newEventFollowUp}
                      onChange={(e) => setNewEventFollowUp(e.target.value)}
                      className={styles["input"]}
                    />
                  </div>
                </div>
              </div>

              <div className={styles["modal-buttons"]}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={styles["cancel-button"]}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSaveEvent}
                  className={styles["save-button"]}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Viewing/Editing Event */}
      {editModalOpen && selectedEvent && (
        <div className={styles["modal-overlay"]}>
          <div className={styles["modal"]}>
            <button
              className={styles["close-button"]}
              onClick={() => setEditModalOpen(false)}
            >
              ✖
            </button>
            <h2 className={styles["modal-heading"]}>Event Details</h2>
            {selectedEvent.isEditing ? (
              <>
                <label>
                  Edit Title:
                  <input
                    type="text"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className={styles["input"]}
                  />
                </label>
                <label>
                  Edit Date:
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className={styles["input"]}
                  />
                </label>
                <label>
                  Edit Start Time:
                  <input
                    type="time"
                    value={moment(selectedEvent.start).format("HH:mm")}
                    onChange={(e) => {
                      const [hour, minute] = e.target.value
                        .split(":")
                        .map(Number);
                      const newStart = new Date(selectedEvent.start);
                      newStart.setHours(hour, minute);
                      setSelectedEvent({
                        ...selectedEvent,
                        start: newStart,
                      });
                    }}
                    className={styles["input"]}
                  />
                </label>
                <label>
                  Edit End Time:
                  <input
                    type="time"
                    value={moment(selectedEvent.end).format("HH:mm")}
                    onChange={(e) => {
                      const [hour, minute] = e.target.value
                        .split(":")
                        .map(Number);
                      const newEnd = new Date(selectedEvent.end);
                      newEnd.setHours(hour, minute);
                      setSelectedEvent({
                        ...selectedEvent,
                        end: newEnd,
                      });
                    }}
                    className={styles["input"]}
                  />
                </label>
                <div className={styles["modal-buttons"]}>
                  <button
                    onClick={() =>
                      setSelectedEvent({ ...selectedEvent, isEditing: false })
                    }
                    className={styles["cancel-button"]}
                  >
                    Cancel Edit
                  </button>
                  <button
                    onClick={handleEditEvent}
                    className={styles["save-button"]}
                  >
                    Save Changes
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>
                  <strong>Title:</strong> {selectedEvent.title}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {moment(selectedEvent.start).format("YYYY-MM-DD")}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {moment(selectedEvent.start).format("HH:mm")} -{" "}
                  {moment(selectedEvent.end).format("HH:mm")}
                </p>
                <div className={styles["modal-buttons"]}>
                  <button
                    onClick={() =>
                      setSelectedEvent({ ...selectedEvent, isEditing: true })
                    }
                    className={styles["edit-button"]}
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteEvent}
                    className={styles["delete-button"]}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;

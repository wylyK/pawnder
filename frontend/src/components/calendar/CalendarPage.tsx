"use client";

import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import NavBar from "../Navigation/NavBar"; // Adjust path as needed
import styles from "./CalendarPage.module.css";

const localizer = momentLocalizer(moment);

interface Event {
  title: string;
  start: Date;
  end: Date;
  isEditing?: boolean;
}

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      title: "Vet Appointment - Annual check-up",
      start: new Date(2024, 10, 3, 10, 0), // November 3rd, 2024
      end: new Date(2024, 10, 3, 11, 0),
    },
    {
      title: "Grooming - Full grooming session",
      start: new Date(2024, 10, 5, 14, 0), // November 5th, 2024
      end: new Date(2024, 10, 5, 15, 0),
    },
  ]);

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

  // Automatically update the date field in the modal based on the current view
  useEffect(() => {
    if (currentView === "day") {
      setNewEventDate(moment(currentDate).format("YYYY-MM-DD"));
    } else if (currentView === "month" || currentView === "week") {
      setNewEventDate(moment(new Date()).format("YYYY-MM-DD")); // Default to today
    }
  }, [currentView, currentDate]);

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

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setNewEventTitle(event.title); // Pre-fill the title in the modal
    setNewEventDate(moment(event.start).format("YYYY-MM-DD"));
    setNewEventStartTime(moment(event.start).format("HH:mm"));
    setNewEventEndTime(moment(event.end).format("HH:mm"));
    setEditModalOpen(true); // Open the modal for event details
  };

  const handleSaveEvent = () => {
    if (
      !newEventTitle ||
      !newEventStartTime ||
      !newEventEndTime ||
      !newEventDate
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const [startHour, startMinute] = newEventStartTime.split(":").map(Number);
    const [endHour, endMinute] = newEventEndTime.split(":").map(Number);
    const startDate = new Date(newEventDate);
    const endDate = new Date(newEventDate);

    startDate.setHours(startHour, startMinute);
    endDate.setHours(endHour, endMinute);

    if (endDate <= startDate) {
      alert("End time must be after start time.");
      return;
    }

    setEvents([
      ...events,
      {
        title: newEventTitle,
        start: startDate,
        end: endDate,
      },
    ]);

    // Reset the form and close the modal
    setNewEventTitle("");
    setNewEventDate(moment(new Date()).format("YYYY-MM-DD"));
    setNewEventStartTime("");
    setNewEventEndTime("");
    setModalOpen(false);
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

    setEvents(updatedEvents); // Update the events array
    setEditModalOpen(false); // Close the modal
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
          <ul className={styles["checklist"]}>
            {events.map((event, index) => (
              <li key={index} className={styles["checklist-item"]}>
                <strong>
                  {moment(event.start).format("YYYY-MM-DD HH:mm")}
                </strong>
                : {event.title}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setModalOpen(true)}
            className={styles["add-button"]}
          >
            Add Event
          </button>
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
            <label>
              Event Name:
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className={styles["input"]}
              />
            </label>
            <label>
              Date:
              <input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className={styles["input"]}
              />
            </label>
            <label>
              Start Time:
              <input
                type="time"
                value={newEventStartTime}
                onChange={(e) => setNewEventStartTime(e.target.value)}
                className={styles["input"]}
              />
            </label>
            <label>
              End Time:
              <input
                type="time"
                value={newEventEndTime}
                onChange={(e) => setNewEventEndTime(e.target.value)}
                className={styles["input"]}
              />
            </label>
            <div className={styles["modal-buttons"]}>
              <button
                onClick={() => setModalOpen(false)}
                className={styles["cancel-button"]}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                className={styles["save-button"]}
              >
                Save
              </button>
            </div>
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

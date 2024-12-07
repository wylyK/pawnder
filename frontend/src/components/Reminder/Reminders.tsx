"use client";

import React, { useEffect, useState } from "react";
import styles from "./Reminders.module.css";
import { AiOutlinePlusCircle, AiFillPlusCircle } from "react-icons/ai";
import { PiTrash, PiTrashFill } from "react-icons/pi";
import { ReminderOptions } from "./ReminderOptions";
import { useAllEvents } from "@/hooks/use-all-events";
import { FromVet } from "./FromVet";
import { PetReminder } from "@/share/type";
import { useReminder } from "@/hooks/use-reminder";
import { ReminderCard } from "./ReminderCard";
import { useGetAllRemindersByUserId } from "@/hooks/use-get-all-reminders-by-user-id";
import { useGetAllPetIdsByUserId } from "@/hooks/use-get-all-pet-ids-by-user-id";
import PetSelectField from "../calendar/PetSelectField";

const Reminders = () => {
  const [deleteCounter, setCounter] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRemiderOption, setSelectedRemiderOption] =
    useState<string>("Reminder From Vet");
  const [selectedFromVet, setSelectedFromVet] = useState<PetReminder>();
  const [reminders, setReminders] = useState<PetReminder[]>([]);
  const [reminderToDeleteIds, setReminderToDeleteIds] = useState<string[]>([]);
  const [newEventPetAssigned, setNewEventPetAssigned] = useState<string>("");
  const [newReminderName, setNewReminderName] = useState<string>("");
  const [newReminderDate, setNewReminderDate] = useState<string>("");
  const [newReminderDescription, setNewReminderDescription] =
    useState<string>("");

  const { allEvents, status: allEventsStatus } = useAllEvents();
  const { remindersOfUser, status: remindersOfUserStatus } =
    useGetAllRemindersByUserId();
  const { createReminder, deleteMultipleReminders } = useReminder();
  const { petIds } = useGetAllPetIdsByUserId();

  useEffect(() => {
    if (remindersOfUserStatus === "success") {
      setReminders(remindersOfUser || []);
    }
  }, [remindersOfUser, remindersOfUserStatus]);

  const toggle = (index: number, reminderId: string) => {
    setReminders((prevReminders) =>
      prevReminders.map((reminder, i) =>
        i === index ? { ...reminder, Toggled: !reminder.Toggled } : reminder,
      ),
    );

    setReminderToDeleteIds((prevIds) => {
      if (prevIds.includes(reminderId)) {
        return prevIds.filter((id) => id !== reminderId);
      } else {
        return [...prevIds, reminderId];
      }
    });
  };

  const trash = () => {
    if (reminderToDeleteIds.length === 0) return;
    deleteMultipleReminders(
      {
        reminderIds: reminderToDeleteIds,
      },
      {
        onSuccess: () => {
          setReminders(reminders.filter((reminder) => !reminder.Toggled));
          setReminderToDeleteIds([]);
        },
        onError: (error) => {
          alert(`Error deleting reminders: ${error.message}`);
        },
      },
    );
  };

  const increment = (step: number) => {
    setCounter(deleteCounter + step);
  };

  const handleSaveReminder = () => {
    if (
      (!selectedFromVet || !selectedFromVet.PetId) &&
      (!newReminderName ||
        !newReminderDate ||
        !newEventPetAssigned ||
        !newReminderDescription)
    ) {
      alert(
        "Please select an event or provide the necessary reminder details.",
      );
      return;
    }
    let finalSelectedFromVet = selectedFromVet;
    if (!finalSelectedFromVet) {
      finalSelectedFromVet = {
        Id: "",
        Name: newReminderName,
        DateTime: newReminderDate,
        Description: newReminderDescription,
        PetId: newEventPetAssigned,
      };
    }
    const newReminder = {
      Id: "",
      Name: finalSelectedFromVet.Name,
      DateTime: finalSelectedFromVet.DateTime,
      Description: finalSelectedFromVet.Description,
    };
    createReminder(
      {
        petId: finalSelectedFromVet.PetId || newEventPetAssigned,
        newReminder,
      },
      {
        onSuccess: () => {
          setReminders((prevReminders) => [
            ...prevReminders,
            finalSelectedFromVet,
          ]);
          setSelectedFromVet(undefined);
          setNewReminderName("");
          setNewReminderDate("");
          setNewEventPetAssigned("");
          setNewReminderDescription("");
          setModalOpen(false);
        },
        onError: (error) => {
          alert(`Error creating reminder: ${error.message}`);
        },
      },
    );
  };

  return (
    <div className={styles["reminders"]}>
      <div className={styles["add-delete"]}>
        {/* <div className={styles["add-delete-container"]}> */}
        <button
          onClick={() => setModalOpen(true)}
          className={styles["add-delete-container"]}
        >
          <AiOutlinePlusCircle className={styles["dormant"]} />
          <AiFillPlusCircle className={styles["hovered"]} />
        </button>
        {/* </div> */}
        <div className={styles["delete-counter"]}>
          {deleteCounter != 0 && deleteCounter}
        </div>
        <div
          className={styles["add-delete-container"]}
          onClick={() => {
            trash();
            setCounter(0);
          }}
        >
          <PiTrash className={styles["dormant"]} />
          <PiTrashFill className={styles["hovered"]} />
        </div>
      </div>
      {reminders.map((reminder, index) => (
        <ReminderCard
          key={index}
          reminder={reminder}
          index={index}
          toggle={toggle}
          increment={increment}
        />
      ))}

      {/* Model to Add Reminder */}
      {modalOpen && (
        <div className={styles["modal-overlay"]}>
          <div className={styles["modal"]}>
            <button
              className={styles["close-button"]}
              onClick={() => setModalOpen(false)}
            >
              ✖
            </button>
            <h2 className={styles["modal-heading"]}>Add Reminder</h2>
            <form className={styles["modal-form"]}>
              <div className={styles["form-sections"]}>
                <div className={styles["form-section"]}>
                  <ReminderOptions
                    selectedRemiderOption={selectedRemiderOption}
                    setSelectedRemiderOption={setSelectedRemiderOption}
                  />
                </div>

                <div className={styles["vertical-divider"]}></div>

                {selectedRemiderOption === "Reminder From Vet" ? (
                  <div className={styles["form-section"]}>
                    <FromVet
                      allEventsStatus={allEventsStatus}
                      allEvents={allEvents}
                      selectedFromVet={selectedFromVet}
                      setSelectedFromVet={setSelectedFromVet}
                    />
                  </div>
                ) : (
                  <div className={styles["form-section"]}>
                    <div className={styles["form-group"]}>
                      <label htmlFor="reminderName">Event Name:</label>
                      <input
                        id="reminderName"
                        type="text"
                        value={newReminderName}
                        onChange={(e) => setNewReminderName(e.target.value)}
                        className={styles["input"]}
                      />
                    </div>
                    <div className={styles["form-group"]}>
                      <label htmlFor="reminderDate">Date:</label>
                      <input
                        id="reminderDate"
                        type="datetime-local"
                        value={newReminderDate}
                        onChange={(e) => setNewReminderDate(e.target.value)}
                        className={styles["input"]}
                      />
                    </div>
                    <PetSelectField
                      newEventPetAssigned={newEventPetAssigned}
                      setNewEventPetAssigned={setNewEventPetAssigned}
                      petIds={petIds}
                    />
                    <div className={styles["form-group"]}>
                      <label htmlFor="description">Description:</label>
                      <textarea
                        id="description"
                        value={newReminderDescription}
                        onChange={(e) =>
                          setNewReminderDescription(e.target.value)
                        }
                        className={styles["input"]}
                        rows={2}
                      ></textarea>
                    </div>
                  </div>
                )}
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
                  onClick={(e) => {
                    e.preventDefault();
                    handleSaveReminder();
                  }}
                  className={styles["save-button"]}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;

import React from "react";
import styles from "./Reminders.module.css";
import { PetReminder } from "@/share/type";
import { FaClock, FaRegCheckCircle, FaCheckCircle } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { usePetsByPetIds } from "@/hooks/use-pets-by-pet-ids";

type ReminderCardProps = {
  reminder: PetReminder;
  index: number;
  toggle: (index: number, reminderId: string) => void;
  increment: (step: number) => void;
};

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  index,
  toggle,
  increment,
}) => {
  if (!reminder.PetId) return null;

  const { pets, status: petsStatus } = usePetsByPetIds([reminder.PetId]);
  if (petsStatus !== "success" || !pets) return null;

  const date = new Date(reminder.DateTime);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  const humanReadableDate = date.toLocaleString("en-US", options);

  return (
    <div className={styles["reminder"]}>
      <div className={styles["main-content"]}>
        <div className={styles["heading"]}>
          <div className="clock">
            <FaClock />
          </div>
          <div className={styles["name"]}>{pets[reminder.PetId].Name}</div>
        </div>
        <div className={styles["subhead"]}>
          <p className={styles["time"]}>{humanReadableDate}</p>
        </div>
        <p className={styles["body"]}>{reminder.Description}</p>
      </div>
      <div className={styles["edit-check"]}>
        <button className={styles["edit"]}>
          <BsThreeDotsVertical />
        </button>
        <div
          className={`${styles["check-container"]} ${reminder.Toggled ? styles["toggled"] : ""}`}
          onClick={() => {
            increment(reminder.Toggled ? -1 : 1);
            toggle(index, reminder.Id);
          }}
        >
          <FaRegCheckCircle className={styles["dormant"]} />
          <FaCheckCircle className={styles["hovered"]} />
        </div>
      </div>
    </div>
  );
};

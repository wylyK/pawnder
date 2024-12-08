"use client";

import React from "react";
import styles from "./Reminders.module.css";

type ReminderOptionsProps = {
  selectedRemiderOption: string;
  setSelectedRemiderOption: React.Dispatch<React.SetStateAction<string>>;
};

export const ReminderOptions: React.FC<ReminderOptionsProps> = ({
  selectedRemiderOption,
  setSelectedRemiderOption,
}) => {
  return (
    <div className={styles["pet-section"]}>
      {["Reminder From Vet", "Create New Reminder"].map((option) => (
        <button
          key={option}
          className={`${styles["pet-card"]} ${
            selectedRemiderOption === option ? styles["selected-pet-card"] : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            setSelectedRemiderOption(option);
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

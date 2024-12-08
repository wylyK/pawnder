"use client";

import React from "react";
import styles from "./Reminders.module.css";
import { PetEvent, PetReminder } from "@/share/type";
import moment from "moment";

type FromVetProps = {
  allEventsStatus: string;
  allEvents: PetEvent[] | undefined;
  selectedFromVet: PetReminder | undefined;
  setSelectedFromVet: React.Dispatch<
    React.SetStateAction<PetReminder | undefined>
  >;
};

export const FromVet: React.FC<FromVetProps> = ({
  allEventsStatus,
  allEvents,
  selectedFromVet,
  setSelectedFromVet,
}) => {
  const handleSelectFromVet = (event: PetEvent) => {
    setSelectedFromVet({
      Id: "",
      Name: event.Name,
      PetId: event.PetId || "",
      DateTime: event.DateTime,
      Description: event.Description || "",
      FromVet: true,
      Toggled: false,
    });
  };

  return (
    <div className={styles["checklist"]}>
      {allEventsStatus &&
        allEvents &&
        allEvents.map((event, index) => (
          <div
            key={index}
            className={styles["card"]}
            onClick={() => handleSelectFromVet(event)}
          >
            <h4 className={styles["card-title"]}>{event.Name}</h4>
            <p className={styles["card-date"]}>
              {moment(event.DateTime).format("YYYY-MM-DD HH:mm")}
            </p>
            <p className={styles["card-location"]}>{event.Description}</p>
          </div>
        ))}
    </div>
  );
};

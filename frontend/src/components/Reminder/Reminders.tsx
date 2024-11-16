"use client";

import React, { useState } from "react";
import styles from "./Reminders.module.css";
import { AiOutlinePlusCircle, AiFillPlusCircle } from "react-icons/ai";
import { PiTrash, PiTrashFill } from "react-icons/pi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaClock, FaRegCheckCircle, FaCheckCircle } from "react-icons/fa";

interface Reminder {
  pet: string;
  time: string;
  body: string;
  fromVet: boolean;
  toggled: boolean;
}

const walk: Reminder = {
  pet: "Fionn",
  time: "15:10",
  body: "Go for a walk",
  fromVet: false,
  toggled: false,
};

const feed: Reminder = {
  pet: "Spike",
  time: "16:30",
  body: "Feed medicine",
  fromVet: true,
  toggled: false,
};

const wash: Reminder = {
  pet: "Bella",
  time: "17:30",
  body: "Use water and put it on Bella, make sure its warm",
  fromVet: false,
  toggled: false,
};

const Reminders = () => {
  const [reminders, updateReminders] = useState<Reminder[]>([walk, feed, wash]);
  const [deleteCounter, updateCounter] = useState(0);

  const toggle = (index: number) => {
    updateReminders(
      reminders.map((reminder, i) =>
        i === index ? { ...reminder, toggled: !reminder.toggled } : reminder,
      ),
    );
  };
  const trash = () => {
    updateReminders(reminders.filter((reminder) => !reminder.toggled));
  };
  const increment = (step: number) => {
    updateCounter(deleteCounter + step);
  };

  return (
    <div className={styles["reminders"]}>
      <div className={styles["add-delete"]}>
        <div className={styles["add-delete-container"]}>
          <AiOutlinePlusCircle className={styles["dormant"]} />
          <AiFillPlusCircle className={styles["hovered"]} />
        </div>
        <div className={styles["delete-counter"]}>
          {deleteCounter != 0 && deleteCounter}
        </div>
        <div
          className={styles["add-delete-container"]}
          onClick={() => {
            trash();
            updateCounter(0);
          }}
        >
          <PiTrash className={styles["dormant"]} />
          <PiTrashFill className={styles["hovered"]} />
        </div>
      </div>
      {reminders.map((reminder, index) => (
        <div key={index} className={styles["reminder"]}>
          <div className={styles["main-content"]}>
            <div className={styles["heading"]}>
              <div className="clock">
                <FaClock />
              </div>
              <div className={styles["name"]}>{reminder.pet}</div>
            </div>
            <div className={styles["subhead"]}>
              <p className={styles["time"]}>{reminder.time}</p>
              <p>
                <i>{reminder.fromVet && " from Dr. Willy"}</i>
              </p>
            </div>
            <p className={styles["body"]}>{reminder.body}</p>
          </div>
          <div className={styles["edit-check"]}>
            <button className={styles["edit"]}>
              <BsThreeDotsVertical />
            </button>
            <div
              className={`${styles["check-container"]}
                             ${reminder.toggled ? styles["toggled"] : ""}`}
              onClick={() => {
                increment(reminder.toggled ? -1 : 1);
                toggle(index);
              }}
            >
              <FaRegCheckCircle className={styles["dormant"]} />
              <FaCheckCircle className={styles["hovered"]} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Reminders;

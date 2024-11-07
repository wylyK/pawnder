import React from "react";
import styles from "./Reminders.module.css"
import { AiOutlinePlus } from "react-icons/ai";

interface Reminder {
    time:  string;
    text:  string;
    fromVet: boolean;
}

const reminders: Reminder[] = [
    {
      time: "15:10",
      text: "Go for a walk",
      fromVet: false,
    },
    {
      time: "16:30",
      text: "Feed medicine",
      fromVet: true,
    },
  ];

const Reminders = () => {
    return (
        <div className={styles.reminders}>
            <div className={styles.addReminder}>
                <AiOutlinePlus/>
            </div>
            {reminders.map((reminder, index) => (
                <div key={index} className={styles.reminder}>
                    <h3 className={styles.reminderHead}>{reminder.text}</h3>
                    <div className={styles.reminderSubHead}>
                        <p className={styles.reminderTime}>{reminder.time}</p>
                        <p><i>{reminder.fromVet && " from Dr. Willy"}</i></p>
                    </div>
                    <div className={styles.reminderButtons}>
                        <button>Edit</button>
                        <button>Done</button>
                    </div>
                </div>
            ))}
        </div>
    )
}



export default Reminders;
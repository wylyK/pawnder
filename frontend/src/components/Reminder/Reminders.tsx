import React from "react";
import styles from "./Reminders.module.css"
import { AiOutlinePlus } from "react-icons/ai";

interface Reminder {
    pet : string;
    time: string;
    body: string;
    fromVet: boolean;
}

const reminders: Reminder[] = [
    {
      pet: "Fionn",
      time: "15:10",
      body: "Go for a walk",
      fromVet: false,
    },
    {
      pet : "Spike",
      time: "16:30",
      body: "Feed medicine",
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
                    <h3 className={styles.reminderHead}>{reminder.pet}</h3>
                    <div className={styles.reminderSubHead}>
                        <p className={styles.reminderTime}>{reminder.time}</p>
                        <p><i>{reminder.fromVet && " from Dr. Willy"}</i></p>
                    </div>
                    <p className={styles.reminderBody}>{reminder.body}</p>
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
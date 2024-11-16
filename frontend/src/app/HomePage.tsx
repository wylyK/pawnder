// HomePage.tsx
import React from "react";
import NavBar from "../components/Navigation/NavBar";
import PetOverview from "../components/PetOverview/PetOverview";
import { FaPaw } from "react-icons/fa"; // Import paw icon
import Reminders from "@/components/Reminder/Reminders";
import styles from "./HomePage.module.css"; // Import CSS module
import "./globals.css"; // Import global styles

const HomePage: React.FC = () => {
  return (
    <div className={styles.container}>
      <NavBar />
      <main className={styles.main}>
        {/* Header section with logo */}
        <div className={styles.header}>
          <h1 className={styles.heading}>Your Pets</h1>
          <div className={styles.logo}>
            <FaPaw
              size={30}
              color="var(--text-color)"
              style={{ marginRight: "8px" }}
            />
            <span className={styles.title}>Pawnder</span>
          </div>
        </div>
        <div className={styles["card-container"]}>
          <PetOverview />
        </div>
        <Reminders />
      </main>
    </div>
  );
};

export default HomePage;

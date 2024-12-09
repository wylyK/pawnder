// VetHomePage.tsx
"use client";

import React from "react";
import NavBar from "../Navigation/NavBar";
import VetPetOverview from "./VetPetOverview";
import { FaPaw } from "react-icons/fa";
import styles from "./VetHomePage.module.css";

const VetHomePage: React.FC = () => {
  return (
    <div className={styles.container}>
      <NavBar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Your Clients</h1>
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
          <VetPetOverview />
        </div>
      </main>
    </div>
  );
};

export default VetHomePage;

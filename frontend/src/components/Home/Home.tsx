"use client";

import React, { useEffect } from "react";
import NavBar from "../Navigation/NavBar";
import PetOverview from "../PetOverview/PetOverview";
import { FaPaw } from "react-icons/fa"; // Import paw icon
import Reminders from "@/components/Reminder/Reminders";
import styles from "./Home.module.css"; // Import CSS module
import { useAuth } from "@/context/UserContext";
import { useRouter } from "next/navigation";

const HomePage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    if (user !== null) {
      return;
    }
    router.push("/login");
  }, [user, router]);

  return (
    <div className={styles.container}>
      <NavBar />
      <main className={styles.main}>
        {/* Header section with logo */}
        <div className={styles.header}>
          <h1 className={styles.heading}> {user?.FName}&apos;s Pets</h1>
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

// components/PetOverview.tsx
"use client";

import React from "react";
import { AiOutlinePlus } from "react-icons/ai";
import styles from "./PetOverview.module.css";

interface Pet {
  name: string;
  breed: string;
  image: string;
}

const pets: Pet[] = [
  { name: "Fionn", breed: "Irish Settler + Golden Retriever", image: "/doggo.JPG" },
  { name: "Spike", breed: "Maine Coon", image: "/catto2.webp" },
  { name: "Luna", breed: "Golden Retriever", image: "/retriever.jpeg" },
  { name: "Max", breed: "Labrador", image: "/dog2.avif" },
  { name: "Bella", breed: "Pomeranian", image: "/catto.jpeg" },
];

const PetOverview: React.FC = () => (
  <div className={styles.wrapper}>
    <div className={styles.grid}>
      {pets.map((pet, index) => (
        <div key={index} className={styles.card}>
          <img src={pet.image} alt={pet.name} />
          <div className={styles["card-content"]}>
            <h2 className={styles["card-title"]}>{pet.name}</h2>
            <p className={styles["card-subtitle"]}>{pet.breed}</p>
          </div>
        </div>
      ))}
      <div className={`${styles.card} ${styles.addCard}`}>
        <AiOutlinePlus size={50} color="#555" />
        <p>Add Pet</p>
      </div>
    </div>
  </div>
);

export default PetOverview;

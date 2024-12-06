"use client";

import React from "react";
import styles from "./CalendarPage.module.css";
import { usePetsByPetIds } from "@/hooks/use-pets-by-pet-ids";

type PetCardsProps = {
  petIds: string[];
  selectedPet: string;
  setSelectedPet: React.Dispatch<React.SetStateAction<string>>;
};

export const PetCards: React.FC<PetCardsProps> = ({
  petIds,
  selectedPet,
  setSelectedPet,
}) => {
  const { pets, status: petsStatus } = usePetsByPetIds(petIds);

  return (
    <div className={styles["pet-cards"]}>
      <button
        className={`${styles["pet-card"]} ${
          selectedPet === "" ? styles["selected-pet-card"] : ""
        }`}
        onClick={() => setSelectedPet("")}
      >
        All Pets
      </button>
      {petsStatus === "success" &&
        pets &&
        Object.keys(pets).length > 0 &&
        Object.entries(pets).map(([petId, petRecord]) => (
          <button
            key={petId}
            className={`${styles["pet-card"]} ${
              selectedPet === petId ? styles["selected-pet-card"] : ""
            }`}
            onClick={() => setSelectedPet(petId)}
          >
            {petRecord.Name}
          </button>
        ))}
    </div>
  );
};

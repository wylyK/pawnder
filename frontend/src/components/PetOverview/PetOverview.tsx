// components/PetOverview.tsx
"use client";
import React, { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import styles from "./PetOverview.module.css";
import Modal from "./Modal";
import PetProfile from "./PetProfile";

interface Pet {
  id: string;
  name: string;
  breed: string;
  image: string;
}

const pets: Pet[] = [
  {
    id: "1",
    name: "Fionn",
    breed: "Irish Setter + Golden Retriever",
    image: "/doggo.JPG",
  },
  { id: "2", name: "Spike", breed: "Maine Coon", image: "/dog2.avif" },
  {
    id: "3",
    name: "Luna",
    breed: "Golden Retriever",
    image: "/retriever.jpeg",
  },
  { id: "4", name: "Max", breed: "Labrador", image: "/dog2.avif" },
  { id: "5", name: "Bella", breed: "Pomeranian", image: "/catto.jpeg" },
];

const PetOverview: React.FC = () => {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const handleOpenModal = (id: string) => {
    setSelectedPetId(id);
  };

  const handleCloseModal = () => {
    setSelectedPetId(null);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {pets.map((pet) => (
          <div
            key={pet.id}
            className={styles.card}
            onClick={() => handleOpenModal(pet.id)}
          >
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

      {/* Modal for displaying PetProfile */}
      {selectedPetId && (
        <Modal onClose={handleCloseModal}>
          <PetProfile petId={selectedPetId} />
        </Modal>
      )}
    </div>
  );
};

export default PetOverview;
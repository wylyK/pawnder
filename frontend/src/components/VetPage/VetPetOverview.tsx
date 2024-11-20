// components/VetPetOverview/VetPetOverview.tsx
"use client";
import React, { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import styles from "./VetPetOverview.module.css";
import Modal from "../PetOverview/Modal";
import VetPetProfile from "./VetPetProfile";

interface Pet {
  id: string;
  name: string;
  breed: string;
  owner: string;
  image: string;
}

const pets: Pet[] = [
  {
    id: "1",
    name: "Fionn",
    breed: "Irish Setter + Golden Retriever",
    owner: "Alice",
    image: "/doggo.JPG",
  },
  {
    id: "2",
    name: "Spike",
    breed: "Maine Coon",
    owner: "Sowrathi",
    image: "/dog2.avif",
  },
  {
    id: "3",
    name: "Luna",
    breed: "Golden Retriever",
    owner: "Bob",
    image: "/retriever.jpeg",
  },
  {
    id: "4",
    name: "Max",
    breed: "Labrador",
    owner: "John",
    image: "/dog2.avif",
  },
  {
    id: "5",
    name: "Bella",
    breed: "Pomeranian",
    owner: "Sophia",
    image: "/catto.jpeg",
  },
];

const VetPetOverview: React.FC = () => {
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
              <p className={styles["card-owner"]}>Owner - {pet.owner}</p>
            </div>
          </div>
        ))}
        <div className={`${styles.card} ${styles["add-card"]}`}>
          <AiOutlinePlus size={50} color="#555" />
          <p>Add Pet</p>
        </div>
      </div>

      {/* Modal for displaying PetProfile */}
      {selectedPetId && (
        <Modal onClose={handleCloseModal}>
          <VetPetProfile petId={selectedPetId} />
        </Modal>
      )}
    </div>
  );
};

export default VetPetOverview;

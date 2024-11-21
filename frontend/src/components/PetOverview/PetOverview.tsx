// components/PetOverview.tsx
"use client";
import React, { useState } from "react";

import styles from "./PetOverview.module.css";
import Modal from "./Modal";
import PetProfile from "./PetProfile";
import PetCard from "../PetCard/PetCard";
import AddCard from "../PetCard/AddCard";

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
        {pets.map(({ id, name, breed, image }) => (
          <PetCard
            key={id}
            id={id}
            name={name}
            breed={breed}
            image={image}
            age={-1}
            handlePopup={() => handleOpenModal(id)}
          />
        ))}
        <AddCard />
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

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AiOutlinePlus } from "react-icons/ai";
import { useGetAllPetIdsByUserId } from "@/hooks/use-get-all-pet-ids-by-user-id";
import { usePetsByPetIds } from "@/hooks/use-pets-by-pet-ids";
import Modal from "./Modal";
import PetProfile from "./PetProfile";
import AddPet from "./AddPet";
import styles from "./PetOverview.module.css";
import { useQueryClient } from "@tanstack/react-query";

const PetOverview: React.FC = () => {
  const queryClient = useQueryClient();
  const { petIds, status: petIdsStatus, error: petIdsError } = useGetAllPetIdsByUserId();
  const { pets, status: petsStatus, error: petsError } = usePetsByPetIds(petIds || []);

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [isAddingPet, setIsAddingPet] = useState(false);

  const handleOpenModal = (id: string) => {
    setSelectedPetId(id);
  };

  const handleCloseModal = (deletedPetId?: string) => {
    setSelectedPetId(null); // Close modal
    if (deletedPetId) {
      // Update the React Query cache manually
      queryClient.setQueryData(["usePetsByPetIds"], (oldData: Record<string, any> | undefined) => {
        if (!oldData) return oldData; // If no data, return as is
        const updatedData = { ...oldData };
        delete updatedData[deletedPetId]; // Remove the deleted pet
        return updatedData;
      });
    }
  };

  const handleOpenAddPet = () => {
    setIsAddingPet(true);
  };

  const handleCloseAddPet = (newPet?: Record<string, any>) => {
    setIsAddingPet(false);
  
    if (newPet) {
      // Update the React Query cache manually
      queryClient.setQueryData(["usePetsByPetIds"], (oldData: Record<string, any> | undefined) => {
        if (!oldData) return { ...newPet }; // If no data, return the new pet as initial data
        return { ...oldData, ...newPet }; // Add the new pet to the existing data
      });
    }
  };

  // Handle loading or errors
  if (petIdsStatus === "pending" || petsStatus === "pending") {
    return <div>Loading your pets...</div>;
  }

  if (petIdsStatus === "error" || petsStatus === "error") {
    return <div>Error loading pets. Please try again later.</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {pets &&
          Object.entries(pets).map(([id, pet]) => (
            <div
              key={id}
              className={styles.card}
              onClick={() => handleOpenModal(id)}
            >
              <Image
                src={pet.Avatar || "/default_user.jpg"}
                width={200}
                height={200}
                alt={pet.Name}
                className={styles.image}
              />
              <div className={styles["card-content"]}>
                <h2 className={styles["card-title"]}>{pet.Name}</h2>
                <p className={styles["card-subtitle"]}>{pet.Breed}</p>
              </div>
            </div>
          ))}
        <div
          className={`${styles.card} ${styles["add-card"]}`}
          onClick={handleOpenAddPet}
        >
          <AiOutlinePlus size={50} color="#555" />
          <p>Add Pet</p>
        </div>
      </div>

      {/* Modal for displaying PetProfile */}
      {selectedPetId && (
        <Modal onClose={() => handleCloseModal()}>
          <PetProfile
            petId={selectedPetId}
            onClose={(deletedPetId) => handleCloseModal(deletedPetId)}
          />
        </Modal>
      )}

      {/* Modal for adding a new pet */}
      {isAddingPet && (
        <Modal onClose={handleCloseAddPet}>
          <AddPet onClose={handleCloseAddPet} />
        </Modal>
      )}
    </div>
  );
};

export default PetOverview;

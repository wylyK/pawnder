"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AiOutlinePlus } from "react-icons/ai";
import Modal from "../PetOverview/Modal";
import VetPetProfile from "./VetPetProfile";
import styles from "./VetPetOverview.module.css";
import { useAuth } from "@/context/UserContext";
import { useGetPetsByVetId } from "@/hooks/use-get-pets-by-vetId";

const VetPetOverview: React.FC = () => {
  const { user } = useAuth();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Fetch pets assigned to this vet
  const { pets, status, error } = useGetPetsByVetId(user?.Id || "");

  const handleOpenModal = (id: string) => {
    setSelectedPetId(id);
  };

  const handleCloseModal = () => {
    setSelectedPetId(null);
  };

  const handleOpenConnectModal = () => {
    setShowConnectModal(true);
  };

  const handleCloseConnectModal = () => {
    setShowConnectModal(false);
  };

  if (status === "pending") return <div>Loading pets...</div>;
  if (status === "error") return <div>Error: {error?.message || "Failed to load pets."}</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {/* Display pets assigned to this vet */}
        {pets.length > 0 ? (
          pets.map((pet) => (
            <div
              key={pet.id}
              className={styles.card}
              onClick={() => handleOpenModal(pet.id)}
            >
              <Image
                src={pet.Avatar || "/default_user.jpg"}
                alt={pet.Name}
                width={150}
                height={150}
                className={styles.image}
              />
              <div className={styles["card-content"]}>
                <h2 className={styles["card-title"]}>{pet.Name}</h2>
                <p className={styles["card-subtitle"]}>{pet.Breed}</p>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noPets}>No pets assigned to you yet.</div>
        )}

        {/* Add Pet button */}
        <div
          className={`${styles.card} ${styles["add-card"]}`}
          onClick={handleOpenConnectModal}
        >
          <AiOutlinePlus size={30} />
          <p>Connect Pet</p>
        </div>
      </div>

      {/* Modal for Viewing Pet Profile */}
      {selectedPetId && (
        <Modal onClose={handleCloseModal}>
          <VetPetProfile petId={selectedPetId} />
        </Modal>
      )}

      {/* Modal for Connecting a Pet */}
      {showConnectModal && (
        <Modal onClose={handleCloseConnectModal}>
          <div className={styles.connectModal}>
            <h2>Connect a Pet</h2>
            <p>Functionality to connect pets coming soon.</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VetPetOverview;

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AiOutlinePlus } from "react-icons/ai";
import Modal from "../PetOverview/Modal";
import VetPetProfile from "./VetPetProfile";
import styles from "./VetPetOverview.module.css";
import { useGetAllPetIdsByUserId } from "@/hooks/use-get-all-pet-ids-by-user-id";
import { usePetsByPetIds } from "@/hooks/use-pets-by-pet-ids";

const VetPetOverview: React.FC = () => {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Fetch pets assigned to this vet
  const { petIds } = useGetAllPetIdsByUserId();
  // if (!petIds) return;
  const { pets, status: petsStatus } = usePetsByPetIds(petIds || []);

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

  if (petsStatus === "pending") return <div>Loading pets...</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {petsStatus === "success" &&
          pets &&
          Object.keys(pets).length > 0 &&
          Object.entries(pets).map(([petId, petRecord]) => (
            <div
              key={petId}
              className={styles.card}
              onClick={() => handleOpenModal(petId)}
            >
              <Image
                src={petRecord.Avatar || "/default_user.jpg"}
                alt={petRecord.Name}
                width={150}
                height={150}
                className={styles.image}
              />
              <div className={styles["card-content"]}>
                <h2 className={styles["card-title"]}>{petRecord.Name}</h2>
                <p className={styles["card-subtitle"]}>{petRecord.Breed}</p>
              </div>
            </div>
          ))}

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

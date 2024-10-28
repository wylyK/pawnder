// components/PetOverview.tsx
import React from "react";
import { AiOutlinePlus } from "react-icons/ai"; // Importing Plus icon
import styles from "./PetOverview.module.css";

interface Pet {
  name: string;
  breed: string;
  image: string;
}

const pets: Pet[] = [
  {
    name: "Cookie",
    breed: "Samoyed",
    image: "/doggo.JPG",
  },
  {
    name: "Spike",
    breed: "Maine Coon",
    image: "/catto2.webp",
  },
];

const PetOverview: React.FC = () => {
  return (
    <div style={gridStyle}>
      {pets.map((pet, index) => (
        <div key={index} className={styles.card}>
          <img src={pet.image} alt={pet.name} />
          <div className={styles["card-content"]}>
            <h2 className={styles["card-title"]}>{pet.name}</h2>
            <p className={styles["card-subtitle"]}>{pet.breed}</p>
          </div>
        </div>
      ))}
      {/* Add Pet Card */}
      <div className={`${styles.card} ${styles.addCard}`}>
        <AiOutlinePlus size={50} color="#555" />
        <p className={styles["add-pet-text"]}>Add Pet</p>
      </div>
    </div>
  );
};

const gridStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
  justifyContent: "center",
  marginTop: "20px",
};

export default PetOverview;

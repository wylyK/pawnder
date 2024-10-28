// components/PetOverview.tsx
import React from "react";
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
    image: "/retriever.jpeg", // Use public folder for images
  },
  {
    name: "Spike",
    breed: "Maine Coon",
    image: "/catto.jpeg",
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

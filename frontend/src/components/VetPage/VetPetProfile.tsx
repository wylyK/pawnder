// components/VetPage/VetPetProfile.tsx
import React from "react";
import styles from "./VetPetProfile.module.css";

interface VetPetProfileProps {
  petId: string;
}

const pets = {
  "1": {
    name: "Fionn",
    breed: "Irish Setter + Golden Retriever",
    birthday: "10/10/23",
    age: "1 Year",
    weight: "50 lb",
    insurance: "Healthy Paws",
    diet: "Cereal",
    prescription: "Leaves",
    owner: "Alice",
    description: "Very friendly and loves outdoor activities.",
    image: "/dog2.avif",
  },
  "2": {
    name: "Spike",
    breed: "Maine Coon",
    birthday: "05/05/22",
    age: "2 Years",
    weight: "15 lb",
    insurance: "Paws Sure",
    diet: "Dry Food",
    prescription: "None",
    owner: "Alice",
    description: "Shy but loves to cuddle once comfortable.",
    image: "/catto.jpeg",
  },
  // Add other pets with descriptions here
};

const VetPetProfile: React.FC<VetPetProfileProps> = ({ petId }) => {
  const pet = pets[petId as keyof typeof pets] || {
    name: "Unknown",
    breed: "Unknown",
    birthday: "Unknown",
    age: "Unknown",
    weight: "Unknown",
    insurance: "Unknown",
    diet: "Unknown",
    prescription: "Unknown",
    owner: "Unknown",
    description: "No description available.",
    image: "/doggo.JPG",
  };

  return (
    <div className={styles["profile-container"]}>
      <div className={styles["image-section"]}>
        <img src={pet.image} alt={pet.name} className={styles.image} />
      </div>
      <div className={styles["info-section"]}>
        <h1 className={styles.title}>
          {pet.name} - {pet.breed}
        </h1>
        <div className={styles["details-container"]}>
          <div className={styles["details-box"]}>
            <p><strong>Name:</strong> {pet.name}</p>
            <p><strong>Breed:</strong> {pet.breed}</p>
            <p><strong>Birthday:</strong> {pet.birthday}</p>
            <p><strong>Age:</strong> {pet.age}</p>
            <button className={styles["edit-button"]}>Edit</button>
          </div>
          <div className={styles["details-box"]}>
            <p><strong>Weight:</strong> {pet.weight}</p>
            <p><strong>Insurance:</strong> {pet.insurance}</p>
            <p><strong>Diet:</strong> {pet.diet}</p>
            <p><strong>Prescription:</strong> {pet.prescription}</p>
            <button className={styles["edit-button"]}>Edit</button>
          </div>
        </div>
        
        {/* New Horizontal Box for Description and Message */}
        <div className={styles["message-box"]}>
          <h2>Description</h2>
          <p>{pet.description}</p>
          <button className={styles["message-button"]}>Send a Message to {pet.owner}</button>
        </div>
      </div>
    </div>
  );
};

export default VetPetProfile;

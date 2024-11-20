import React from "react";
import styles from "./PetProfile.module.css";

interface PetProfileProps {
  petId: string;
}

const PetProfile: React.FC<PetProfileProps> = ({ petId }) => {
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
      image: "/catto.jpeg",
    },
  };

  const pet = pets[petId as keyof typeof pets] || {
    name: "Unknown",
    breed: "Unknown",
    birthday: "Unknown",
    age: "Unknown",
    weight: "Unknown",
    insurance: "Unknown",
    diet: "Unknown",
    prescription: "Unknown",
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
            <p>
              <strong>Name:</strong> {pet.name}
            </p>
            <p>
              <strong>Breed:</strong> {pet.breed}
            </p>
            <p>
              <strong>Birthday:</strong> {pet.birthday}
            </p>
            <p>
              <strong>Age:</strong> {pet.age}
            </p>
            <div className={styles["button-container"]}>
              <button className={styles["edit-button"]}>Edit</button>
            </div>
          </div>
          <div className={styles["details-box"]}>
            <p>
              <strong>Weight:</strong> {pet.weight}
            </p>
            <p>
              <strong>Insurance:</strong> {pet.insurance}
            </p>
            <p>
              <strong>Diet:</strong> {pet.diet}
            </p>
            <p>
              <strong>Prescription:</strong> {pet.prescription}
            </p>
            <div className={styles["button-container"]}>
              <button className={styles["edit-button"]}>Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetProfile;

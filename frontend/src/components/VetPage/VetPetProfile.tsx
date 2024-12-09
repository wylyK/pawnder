"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./VetPetProfile.module.css";
import api from "../../../api";

interface VetPetProfileProps {
  petId: string;
}

interface Pet {
  id: string;
  Name: string;
  Breed: string;
  Avatar: string;
  Description: string;
  Age: string;
  Tag: string[];
  Owner: string;
}

interface HealthRecord {
  Weight: string;
  Diet: string;
  Prescription: string;
  Insurance: string;
}

interface PetForm {
  id?: string;
  Name?: string;
  Breed?: string;
  Avatar?: File | null;
  Description?: string;
  Age?: string;
  Tag?: string[];
}

const VetPetProfile: React.FC<VetPetProfileProps> = ({ petId }) => {
  const [pet, setPet] = useState<Pet | null>(null);
  const [health, setHealth] = useState<HealthRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PetForm>>({
    id: petId,
    Name: "",
    Breed: "",
    Avatar: null,
    Description: "",
    Age: "",
    Tag: [],
  });
  const [healthData, setHealthData] = useState<Partial<HealthRecord>>({
    Weight: "",
    Diet: "",
    Prescription: "",
    Insurance: "",
  });

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await api.get(`/pets/${petId}`);
        const petData = response.data[petId];
        if (petData.Tag && typeof petData.Tag === "string") {
          petData.Tag = JSON.parse(petData.Tag);
        }
        setPet(petData);
        setFormData(petData);
      } catch (error) {
        console.error("Error fetching pet:", error);
      }
    };

    const fetchHealth = async () => {
      try {
        const response = await api.get(`/pets/${petId}/health`);
        const healthData = response.data || {};
        setHealth(healthData);
        setHealthData({
          Weight: healthData.Weight || "",
          Diet: healthData.Diet || "",
          Prescription: healthData.Prescription || "",
          Insurance: healthData.Insurance || "",
        });
      } catch (error) {
        console.error("Error fetching health records:", error);
        setHealth(null);
      }
    };

    fetchPet();
    fetchHealth();
  }, [petId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name in healthData) {
      setHealthData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        Avatar: file,
      }));
    }
  };

  const handleAddTag = () => {
    const newTag = prompt("Enter a new tag:");
    if (newTag && newTag.trim()) {
      setFormData((prev) => ({
        ...prev,
        Tag: [...(prev.Tag || []), newTag.trim()],
      }));
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      Tag: (prev.Tag || []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      const data = new FormData();
      data.append("Name", formData.Name || "");
      data.append("Breed", formData.Breed || "");
      data.append("Description", formData.Description || "");
      data.append("Age", formData.Age || "");
      data.append("Tag", JSON.stringify(formData.Tag || []));

      if (formData.Avatar) {
        data.append("Avatar", formData.Avatar);
      }

      await api.put(`/pets/${petId}`, data);
      await api.put(`/pets/${petId}/health`, healthData);

      if (!pet) return;

      setPet({
        ...pet,
        ...formData,
        Avatar: formData.Avatar instanceof File ? pet.Avatar : formData.Avatar || pet.Avatar,
      } as Pet);

      setHealth(healthData as HealthRecord);
      setIsEditing(false);
      alert("Pet and health records updated successfully!");
    } catch (error) {
      console.error("Error updating pet or health records:", error);
      alert("Failed to update the pet or health records. Please try again.");
    }
  };

  if (!pet) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.modal}>
      <div className={styles.content}>
        <div className={styles["image-card"]}>
          <Image
            src={pet.Avatar || "/default_user.jpg"}
            alt={pet.Name}
            width={200}
            height={200}
            className={styles.image}
          />
          <div className={styles["tags-container"]}>
            {isEditing ? (
              <>
                {(formData.Tag || []).map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(index)}
                      className={styles["remove-tag-button"]}
                    >
                      ✖
                    </button>
                  </span>
                ))}
                <button
                  onClick={handleAddTag}
                  className={styles["add-tag-button"]}
                >
                  Add Tag
                </button>
              </>
            ) : Array.isArray(pet.Tag) && pet.Tag.length > 0 ? (
              pet.Tag.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))
            ) : (
              <span className={styles.tag}>No Tags</span>
            )}
          </div>
        </div>

        <div className={styles["info-card"]}>
          {isEditing ? (
            <>
              {["Name", "Breed", "Age", "Description"].map((field) => (
                <div key={field} className={styles["input-container"]}>
                  <label className={styles["input-label"]}>
                    {field}:
                    <input
                      type="text"
                      name={field}
                      value={String(formData[field as keyof PetForm] || "")}
                      onChange={handleInputChange}
                      className={styles["input-field"]}
                    />
                  </label>
                </div>
              ))}

              <div className={styles["input-container"]}>
                <label className={styles["input-label"]}>
                  Avatar:
                  <input
                    type="file"
                    name="Avatar"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles["input-field"]}
                  />
                </label>
              </div>
              <h2 className={styles["section-title"]}>Health Records</h2>
              {["Weight", "Diet", "Prescription", "Insurance"].map((field) => (
                <div key={field} className={styles["input-container"]}>
                  <label className={styles["input-label"]}>
                    {field}:
                    <input
                      type="text"
                      name={field}
                      value={healthData[field as keyof HealthRecord] || ""}
                      onChange={handleInputChange}
                      className={styles["input-field"]}
                    />
                  </label>
                </div>
              ))}
              <div className={styles["action-buttons"]}>
                <button className={styles["save-button"]} onClick={handleSave}>
                  Save
                </button>
                <button
                  className={styles["cancel-button"]}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className={styles.title}>{pet.Name}</h1>
              <p><strong>Breed:</strong> {pet.Breed}</p>
              <p><strong>Age:</strong> {pet.Age || "N/A"}</p>
              <p><strong>Description:</strong> {pet.Description || "N/A"}</p>
              <p><strong>Owner:</strong> {pet.Owner}</p>
              <h2 className={styles["section-title"]}>Health Records</h2>
              <p><strong>Weight:</strong> {health?.Weight || "N/A"}</p>
              <p><strong>Diet:</strong> {health?.Diet || "N/A"}</p>
              <p><strong>Prescription:</strong> {health?.Prescription || "N/A"}</p>
              <p><strong>Insurance:</strong> {health?.Insurance || "N/A"}</p>
              <button
                className={styles["edit-button"]}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VetPetProfile;

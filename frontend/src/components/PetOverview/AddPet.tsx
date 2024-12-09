"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/UserContext";
import api from "../../../api";
import styles from "./AddPet.module.css";
import { v4 as uuidv4 } from "uuid";

interface AddPetProps {
  onClose: () => void;
}

const AddPet: React.FC<AddPetProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    id: uuidv4(),
    Name: "",
    Breed: "",
    Type: "",
    Avatar: null as File | null,
    Description: "",
    Age: "",
    Tag: [] as string[],
    UserId: "",
  });

  const [healthData, setHealthData] = useState({
    VetId: "N/A",
    Weight: "N/A",
    Height: "N/A",
    Diet: "N/A",
    Prescription: "N/A",
    Insurance: "N/A",
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({ ...prev, UserId: user.Id }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name in healthData) {
      setHealthData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFormData((prev) => ({
        ...prev,
        Avatar: file,
      }));
    }
  };

  const handleAddTag = () => {
    const newTag = prompt("Enter a new tag:");
    const trimmedTag = newTag?.trim();
    if (trimmedTag && !formData.Tag.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        Tag: [...prev.Tag, trimmedTag],
      }));
    } else if (trimmedTag) {
      alert("Tag already exists.");
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      Tag: prev.Tag.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!formData.Name || !formData.Breed || !formData.Type || !formData.Age) {
      alert("Name, Breed, Type, and Age are mandatory fields.");
      return;
    }
  
    setIsSaving(true);
    try {
      // Step 1: Create the pet
      const petData = new FormData();
      petData.append("Name", formData.Name);
      petData.append("Breed", formData.Breed);
      petData.append("Type", formData.Type);
      petData.append("Age", formData.Age);
      petData.append("Description", formData.Description || "");
      petData.append("UserId", formData.UserId);
      if (formData.Avatar) petData.append("Avatar", formData.Avatar);
      formData.Tag.forEach((tag) => petData.append("Tag[]", tag));
  
      console.log("petdata",petData);
      const response = await api.post("/pets/create", petData);
      console.log("res",response);
  
      const petId = response.data.pet?.id; // Extract petId from response
      if (!petId) {
        alert("Failed to create pet. Please try again.");
        return;
      }
  
      console.log("New Pet ID:", petId);
  
      // Step 2: Add health records
      await api.post(`/pets/${petId}/health`, healthData);
  
      alert("Pet and health records added successfully!");
      onClose();
    } catch (error) {
      console.error("Error adding pet and health records:", error);
      alert("Failed to add pet or health records. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  

  return (
    <div className={styles.modal}>
      <div className={styles.content}>
        <h1 className={styles.header}>New Pet</h1>
        <div className={styles.container}>
          {/* Left Image and Tags Section */}
          <div className={styles["image-section"]}>
            <div className={styles.imagePlaceholder}>
              {formData.Avatar ? (
                <img
                  src={URL.createObjectURL(formData.Avatar)}
                  alt="Avatar Preview"
                  className={styles.avatarPreview}
                />
              ) : (
                <div className={styles.addPhotoContent}>
                  <span>
                    <b>Click to Add Photo</b>
                  </span>
                </div>
              )}
              <div className={styles["input-container"]}>
                <label className={styles["input-label"]}>
                  <input
                    type="file"
                    name="Avatar"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles["input-field"]}
                  />
                </label>
              </div>
            </div>
            <div className={styles["tags-container"]}>
              {formData.Tag.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                  <button
                    className={styles["remove-tag-button"]}
                    onClick={() => handleRemoveTag(index)}
                  >
                    ✖
                  </button>
                </span>
              ))}
              <button
                className={styles["add-tag-button"]}
                onClick={handleAddTag}
              >
                Click To Add Tags
              </button>
            </div>
          </div>

          {/* Right Form Section */}
          <div className={styles["form-section"]}>
            {["Name", "Breed", "Type", "Age", "Description"].map((field) => (
              <div key={field} className={styles["input-container"]}>
                <label className={styles["input-label"]}>{field}:</label>
                <input
                  type="text"
                  name={field}
                  className={styles["input-box"]}
                  value={(formData[field as keyof typeof formData] as string) || ""}
                  onChange={handleInputChange}
                />
              </div>
            ))}

            <h2 className={styles["section-title"]}>Health Records</h2>
            {["Weight", "Height", "Diet", "Prescription", "Insurance"].map(
              (field) => (
                <div key={field} className={styles["input-container"]}>
                  <label className={styles["input-label"]}>{field}:</label>
                  <input
                    type="text"
                    name={field}
                    className={styles["input-box"]}
                    value={healthData[field as keyof typeof healthData] || ""}
                    onChange={handleInputChange}
                  />
                </div>
              )
            )}
          </div>
        </div>

        <div className={styles["action-buttons"]}>
          <button className={styles["cancel-button"]} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles["save-button"]}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPet;

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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({ ...prev, UserId: user.Id }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, Avatar: file }));
  };

  const handleAddTag = () => {
    const newTag = prompt("Enter a new tag:");
    if (newTag && newTag.trim()) {
      setFormData((prev) => ({
        ...prev,
        Tag: [...prev.Tag, newTag.trim()],
      }));
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
      const petData = new FormData();
      petData.append("Name", formData.Name);
      petData.append("Breed", formData.Breed);
      petData.append("Type", formData.Type);
      petData.append("Age", formData.Age);
      petData.append("Description", formData.Description || "");
      petData.append("UserId", formData.UserId);
      if (formData.Avatar) petData.append("Avatar", formData.Avatar);
      formData.Tag.forEach((tag) => petData.append("Tag[]", tag));

      await api.post("/pets/create", petData);
      alert("Pet added successfully!");
      onClose();
    } catch (error) {
      console.error("Error adding pet:", error);
      alert("Failed to add pet. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.content}>
        <div className={styles["image-card"]}>
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
            <input
              type="file"
              className={styles.fileInput}
              accept="image/*"
              onChange={handleFileChange}
            />
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
            <button className={styles["add-tag-button"]} onClick={handleAddTag}>
              Add Tag
            </button>
          </div>
        </div>

        <div className={styles["info-card"]}>
          {["Name", "Breed", "Type", "Age", "Description"].map((field) => (
            <div key={field} className={styles["input-container"]}>
              <label className={styles["input-label"]}>{field}:</label>
              <input
                type="text"
                name={field}
                className={styles["input-box"]}
                value={
                  (formData[field as keyof typeof formData] as string) || ""
                }
                onChange={handleInputChange}
              />
            </div>
          ))}

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
    </div>
  );
};

export default AddPet;

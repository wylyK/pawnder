import React, { useEffect, useState } from "react";
import Image from "next/image";
import api from "../../../api";
import styles from "./PetProfile.module.css";
import { v4 as uuidv4 } from "uuid";

interface PetProfileProps {
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
}

interface PetForm {
  id: string;
  Name: string;
  Breed: string;
  Avatar: File;
  Description: string;
  Age: string;
  Tag: string[];
}

const PetProfile: React.FC<PetProfileProps> = ({ petId }) => {
  const [pet, setPet] = useState<Pet | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PetForm>>({
    id: petId,
    Name: "",
    Breed: "",
    Avatar: undefined,
    Description: "",
    Age: "",
    Tag: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch pet details on component mount
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await api.get(`/pets/${petId}`);
        const petData = response.data[petId];
        setPet(petData);
        setFormData(petData); // Initialize form data for editing
      } catch (error) {
        console.error("Error fetching pet:", error);
      }
    };

    fetchPet();
  }, [petId]);

  // Handle input changes in the edit mode
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle tag addition
  const handleAddTag = () => {
    const newTag = prompt("Enter a new tag:");
    if (newTag && newTag.trim()) {
      setFormData((prev) => ({
        ...prev,
        Tag: [...(prev.Tag || []), newTag.trim()],
      }));
    }
  };

  // Handle tag removal
  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      Tag: (prev.Tag || []).filter((_, i) => i !== index),
    }));
  };
  
  //Handle image file uploaded by user
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFormData((prev) => ({
        ...prev,
        Avatar: file,
      }));
    }
  };

  // Save changes and update the backend
  const handleSave = async () => {
    try {
      const data = new FormData();
      data.append("id", formData.id || "");
      data.append("Name", formData.Name || "");
      data.append("Breed", formData.Breed || "");
      data.append("Description", formData.Description || "");
      data.append("Age", formData.Age || "");
      data.append("Tag", JSON.stringify(formData.Tag || []));

      if (formData.Avatar) {
        data.append("Avatar", formData.Avatar); 
      }
      const response = await api.put(`/pets/${petId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }); 
      const updatedPet = response.data;
      setPet((prev) =>
        prev
          ? {
              ...prev,
              Name: updatedPet["Name"],
              Age: updatedPet["Age"],
              Breed: updatedPet["Breed"],
              Avatar: updatedPet["Avatar"],
              Description: updatedPet["Description"],
            }
          : null,
      );
      setIsEditing(false); // Switch back to the view mode
    } catch (error) {
      console.error("Error updating pet:", error);
    }
  };

  // Cancel editing and return to the view mode
  const handleCancel = () => {
    setFormData({}); // Reset form data
    setIsEditing(false); // Switch back to view mode
  };

  const handleAddPet = async () => {
    setIsSaving(true);
    try {
      await api.post("/pets", formData); // Add the new pet to the backend
      alert("Pet added successfully!");
      setFormData({
        id: uuidv4(),
        Name: "",
        Breed: "",
        Avatar: undefined,
        Description: "",
        Age: "",
        Tag: [],
      }); // Reset the form
    } catch (error) {
      console.error("Error adding pet:", error);
      alert("Failed to add pet. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!pet) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.modal}>
      <div className={styles.content}>
        {/* Left Section: Image and Tags */}
        <div className={styles["image-card"]}>
          <Image
            src={pet.Avatar || "/default_user.jpg"}
            alt={pet.Name}
            width={0} 
            height={0} 
            sizes="100vw"
            className={styles.image}
          />
          <div className={styles["tags-container"]}>
            {isEditing ? (
              <>
                {(formData.Tag || []).map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}{" "}
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
            ) : pet.Tag && pet.Tag.length > 0 ? (
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

        {/* Right Section: Edit Information */}
        <div className={styles["info-card"]}>
          {isEditing ? (
            <>
              <div className={styles["input-container"]}>
                <label className={styles["input-label"]}>
                  Name:
                  <input
                    type="text"
                    name="Name"
                    value={formData.Name || ""}
                    onChange={handleInputChange}
                    className={styles["input-field"]}
                  />
                </label>
              </div>
              <div className={styles["input-container"]}>
                <label className={styles["input-label"]}>
                  Breed:
                  <input
                    type="text"
                    name="Breed"
                    value={formData.Breed || ""}
                    onChange={handleInputChange}
                    className={styles["input-field"]}
                  />
                </label>
              </div>
              <div className={styles["input-container"]}>
                <label className={styles["input-label"]}>
                  Age:
                  <input
                    type="text"
                    name="Age"
                    value={formData.Age || ""}
                    onChange={handleInputChange}
                    className={styles["input-field"]}
                  />
                </label>
              </div>
              <div className={styles["input-container"]}>
                <label className={styles["input-label"]}>
                  Description:
                  <input
                    type="text"
                    name="Description"
                    value={formData.Description || ""}
                    onChange={handleInputChange}
                    className={styles["input-field"]}
                  />
                </label>
              </div>
              <div className={styles["input-container"]}>
                <label className={styles["input-label"]}>
                  Upload Avatar:
                  <input
                    type="file"
                    name="Avatar"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles["input-field"]}
                  />
                </label>
              </div>
              
              <div className={styles["action-buttons"]}>
                <button
                  className={styles["cancel-button"]}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button className={styles["save-button"]} onClick={handleSave}>
                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className={styles.title}>{pet.Name}</h1>
              <p>
                <strong>Breed:</strong> {pet.Breed}
              </p>
              <p>
                <strong>Age:</strong> {pet.Age}
              </p>
              <p>
                <strong>Description:</strong> {pet.Description || "N/A"}
              </p>
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

export default PetProfile;

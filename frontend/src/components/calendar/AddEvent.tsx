"use client";

import { useAuth } from "@/context/UserContext";
import { usePetsByPetIds } from "@/hooks/use-pets-by-pet-ids";
import styles from "./CalendarPage.module.css";
import { useEffect, useState } from "react";

type AddEventProps = {
  newEventPetAssigned: string;
  setNewEventPetAssigned: React.Dispatch<React.SetStateAction<string>>;
};

const AddEvent: React.FC<AddEventProps> = ({
  newEventPetAssigned,
  setNewEventPetAssigned,
}) => {
  const { user } = useAuth();

  const [petIds, setPetIds] = useState<string[]>([]);

  useEffect(() => {
    if (user && user.PetId) {
      const ids = Array.from(new Set(user.PetId));
      const uniqueIds = Array.from(new Set(ids));
      setPetIds(uniqueIds);
    }
  }, [user]);

  const { pets, status: petsStatus } = usePetsByPetIds(petIds);
  if (!user || !user.PetId) return null;

  return (
    <div className={styles["form-group"]}>
      <label htmlFor="petSelect">Pet Name:</label>
      <select
        id="petSelect"
        className={styles["input"]}
        value={newEventPetAssigned}
        onChange={(e) => setNewEventPetAssigned(e.target.value)}
      >
        <option value="" disabled hidden>
          Select Pet
        </option>
        {petsStatus === "success" &&
          pets &&
          Object.keys(pets).length > 0 &&
          Object.entries(pets).map(([petId, petRecord]) => (
            <option key={petId} value={petId}>
              {petRecord.Name}
            </option>
          ))}
      </select>
    </div>
  );
};

export default AddEvent;

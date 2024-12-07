"use client";

import { useAuth } from "@/context/UserContext";
import { usePetsByPetIds } from "@/hooks/use-pets-by-pet-ids";
import styles from "./CalendarPage.module.css";

type PetSelectFieldProps = {
  newEventPetAssigned: string;
  setNewEventPetAssigned: React.Dispatch<React.SetStateAction<string>>;
  petIds: string[] | undefined;
};

const PetSelectField: React.FC<PetSelectFieldProps> = ({
  newEventPetAssigned,
  setNewEventPetAssigned,
  petIds,
}) => {
  const { user } = useAuth();
  if (!user || !user.PetId || !petIds) return null;
  const { pets, status: petsStatus } = usePetsByPetIds(petIds);

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

export default PetSelectField;

"use client"
import styles from "./MatchesOverview.module.css"
import PetCard from "./PetCard"
import React, { useState, useEffect } from "react"
import {
  IoIosArrowDropleft,
  IoIosArrowDropleftCircle,
  IoIosArrowDropright,
  IoIosArrowDroprightCircle,
} from "react-icons/io";
import { PiPawPrintFill } from "react-icons/pi"
import DropDown from "./DropDown"
import FilterList, { Filter } from "./FilterList"
import MatchesPanel from "./MatchesPanel"
import api from "../../../api";
import { useGetAllPetIdsByUserId } from "@/hooks/use-get-all-pet-ids-by-user-id";
import { usePetsByPetIds } from "@/hooks/use-pets-by-pet-ids";
import { useAuth } from "@/context/UserContext";
import { useRouter } from "next/navigation";

const MatchesOverview: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    if (user !== null) {
      return;
    }
    router.push("/login");
  }, [user, router]);

  if (user) console.log("id:" + user.Id);
  
  const { petIds: myPetIds, status, error } = useGetAllPetIdsByUserId();
  console.log("error:" + status + error)
  const myPets   = usePetsByPetIds(myPetIds || []).pets;
  const [filters, updateFilters] = useState<Filter[]>([]);
  const [matchFor, setMatchFor] = useState(0);
  const [unmatchedIds, setUnmatchedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchUnmatchedIds = async () => {
      if (!myPetIds) return
      try {
        const response = await api.get<string[]>(`/pets/${myPetIds[matchFor]}/not_match`);
        console.log("data:" + response.data);
        setUnmatchedIds(response.data || []);
      } catch (error) {
        console.log(`For ${myPetIds[matchFor]}, error occured when fetching unmatched ids: ${error}`);
      }
    }
    fetchUnmatchedIds()
  }, [matchFor, myPetIds]);

  const unmatchedPets = usePetsByPetIds(unmatchedIds).pets;

  const filterCondition = (id: string) =>
      filters.every(( { type, value} ) => {
                                            if (type === "Breed" || type === "Age") {
                                              return unmatchedPets[id][type].toString().toLowerCase().trim() === value.toString().toLowerCase().trim();
                                            } return true;
                                          })

  const filteredPetIds = unmatchedIds.filter(filterCondition); 

  // Pet being shown at the cetner is filteredPetsList[displayedIndex]
  const [displayedIndex, updateDisplayedIndex] = useState(0);

  useEffect(() => {
    updateDisplayedIndex((currentIndex) => {
      const newIndex = Math.floor(filteredPetIds.length / 2);
      return currentIndex < 0 || currentIndex > filteredPetIds.length - 1 ? newIndex : currentIndex;
    })
  }, [filteredPetIds]);

  // Maps the index of a pet in filteredPetsList to its slide position,
  // which in is the range [-2, 2], so at most 5 pets can be shown on the slide
  const slidePosition = (index: number) => {
    return Math.max(Math.min(index - displayedIndex, 3), -3);
  }

  // Assigns CSS class to pets based on their slider index
  const sliderIndex = (index: number) => {
    
    if (slidePosition(index) === 0)
      return styles["current"];
    else if (slidePosition(index) === -3)
      return styles["prev-prev-prev"];
    else if (slidePosition(index) === -2)
      return styles["prev-prev"];
    else if (slidePosition(index) === -1)
      return styles["prev"];
    else if (slidePosition(index) === 1)
      return styles["succ"];
    else if (slidePosition(index) === 2)
      return styles["succ-succ"];
    else if (slidePosition(index) === 3)
      return styles["succ-succ-succ"];
  };

  // Increment/decrement slider index when user presses right/left arrow key
  const slide = (direction: number) => {
    updateDisplayedIndex((index) =>
      0 <= index + direction && index + direction < filteredPetIds.length
        ? index + direction
        : index,
    );
  };

  // Sends a match request to the pet at displayedIndex in filteredPetList
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const handleSubmit = async () => {
    try {
      if (!myPetIds) return;
      const response = await fetch(`${baseUrl}/pets/${myPetIds[matchFor]}/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "myPetID": myPetIds[matchFor],
          "PetId": filteredPetIds[displayedIndex]
        })
    });

      if (response.ok) {
        console.log("Success");
      } else {
        const errorData = await response.json();
        console.log(errorData.error || "Failed to send request. Please try again.");
      }
    } catch (err) {
      console.error("Error Occurred When Trying Send Request:", err);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className={styles.overview}>
      <div className={styles["title"]}>
          <h1>Matchmaker</h1>
          <PiPawPrintFill className={styles["logo"]} />
      </div>
      <DropDown
        options={Object.entries(myPets).map(([, pet]) => pet.Name)}
        prefix="Matching for"
        className={styles["drop-down"]}
        selectedIndex={matchFor}
        onSelect={(index) => { setMatchFor(index) }}
      />
      <div className={styles["slides"]}>
        {filteredPetIds.map((id) => { return { id, ...unmatchedPets[id]} }).map((pet, index) => (
          <PetCard
            className={`${styles["card"]} ${sliderIndex(index)}`}
            key={pet.id}
            name={pet.Name}
            breed={pet.Breed}
            age={pet.Age}
            tags={[]}
            image={pet.Avatar || ""}
            handlePopup={() => { 
              const position = slidePosition(index);
              if (-3 < position && position < 3) slide(position)
            }}
          ></PetCard>
        ))}
      </div>
      <FilterList onFiltersUpdate={updateFilters}/>
      <div className={styles["buttons-container"]}>
        <div className={styles["left-arrow"]} onClick={() => slide(-1)}>
          <IoIosArrowDropleft className={styles["dormant"]} />
          <IoIosArrowDropleftCircle className={styles["hovered"]} />
        </div>
        <button className={styles["match"]} onClick={handleSubmit}>Match</button>
        <div className={styles["right-arrow"]} onClick={() => slide(1)}>
          <IoIosArrowDropright className={styles["dormant"]} />
          <IoIosArrowDroprightCircle className={styles["hovered"]} />
        </div>
      </div>
      <MatchesPanel myPetIds={myPetIds || []} myPets={myPets}/>
    </div>
  );
};

export default MatchesOverview;

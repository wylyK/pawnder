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
import { Pet } from "@/share/type";

const MatchesOverview: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    if (user !== null) {
      return;
    }
    router.push("/login");
  }, [user, router]);

  const { petIds: myPetIds, status, error } = useGetAllPetIdsByUserId();
  const { pets: myPets}  = usePetsByPetIds(myPetIds || []);
  const [filters, updateFilters] = useState<Filter[]>([]);
  const [matchFor, setMatchFor] = useState(0);
  const [unmatchedIds, setUnmatchedIds] = useState<string[]>([]);
  const [unmatchedPets, setUnmatchedPets] = useState<Record<string, Pet>>();

  useEffect(() => {
    const fetchUnmatchedIds = async () => {
      if (!myPetIds) return
      try {
        const response = await api.get<string[]>(`/pets/${myPetIds[matchFor]}/not_match`);
        setUnmatchedIds(response.data || []);
      } catch (error) {
        console.log(`For ${myPetIds[matchFor]}, error occured when fetching unmatched ids: ${error}`);
      }
    }
    fetchUnmatchedIds()
  }, [matchFor, myPetIds]);

  console.log("unm", unmatchedIds);

  useEffect(() => {
    const fetchUnmatchedPets = async () => {
      if (!unmatchedIds) return
      try {
        console.log("unnnn", unmatchedIds);
        const queryString = `ids=${unmatchedIds.join(",")}`;
        const response = await api.get<Record<string, Pet>>(`/pets/ids?${queryString}`);
        console.log("res",response)
        const petsObject = (response.data) as Record<string, Pet>;
        console.log("petObjects", petsObject);
        setUnmatchedPets(petsObject);
      } catch (error) {
        console.log(`error occured when fetching unmatched ids: ${error}`);
      }
    }
    fetchUnmatchedPets()
  }, [unmatchedIds]);

  console.log("unm", unmatchedPets);

  
  // const { pets: unmatchedPets, status: unmatchedPetsStatus } = usePetsByPetIds(unmatchedIds);

  // const [filteredPetIds, setFilteredPetIds] = useState<string[]>([]);


  
  // useEffect(() => {
  //   if (unmatchedIds) {
  //     const filterCondition = (id: string) =>
  //     filters.every(( { type, value} ) => {
  //                                             if (type === "Breed" || type === "Age") {
  //                                             return unmatchedPets[id][type].toString().toLowerCase().trim() === value.toString().toLowerCase().trim();
  //                                           } return true;
  //                                         })
  //     setFilteredPetIds(unmatchedIds.filter(filterCondition))
  //     console.log(filteredPetIds);
  //   }
  // }, [unmatchedIds, unmatchedPets, filteredPetIds, filters, ]);

  // Pet being shown at the cetner is filteredPetsList[displayedIndex]

  const [displayedIndex, updateDisplayedIndex] = useState(0);

  useEffect(() => {
    updateDisplayedIndex((currentIndex) => {
      const newIndex = Math.floor(unmatchedIds.length / 2);
      return currentIndex < 0 || currentIndex > unmatchedIds.length - 1 ? newIndex : currentIndex;
    })
  }, [unmatchedIds]);

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
      0 <= index + direction && index + direction < unmatchedIds.length
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
          // "myPetID": myPetIds[matchFor],
          "PetId": unmatchedIds[displayedIndex]
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

  console.log("unmatched", unmatchedPets);

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
        {unmatchedPets &&
            Object.keys(unmatchedPets).length > 0 &&
            Object.entries(unmatchedPets).map(([petId, petRecord], index) => ( 
          <PetCard
            className={`${styles["card"]} ${sliderIndex(index)}`}
            key={index}
            // name={pet.Name}
            // breed={pet.Breed}
            // age={pet.Age}
            // tags={[]}
            // image={pet.Avatar || ""}
            petRecord = { petRecord }
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

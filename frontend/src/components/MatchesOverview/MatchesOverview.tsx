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
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/UserContext";
import { User } from "@/share/type";

interface Pet {
  id: string;
  Name: string;
  Age: string;
  Breed: string;
  Avatar: string;
  Tag: string[];
  UserId: string;
  Description: string;
}

const MatchesOverview: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, updateFilters] = useState<Filter[]>([]);

  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    if (user !== null) {
      return;
    }
    router.push("/login");
  }, [user, router]);

  console.log(user);
  const userId = (user as User).Id

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await api.get<{ [key: string]: Omit<Pet, "id"> }>("/pets");
        const petsData = Object.entries(response.data).map(([id, pet]) => ({
          id,
          ...pet,
        }));
        setPets(petsData);
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setIsLoading(false)
      }
    };

    fetchPets();
  }, []);

  // User's pets
  const yourPets = React.useMemo(
    () => pets.filter((pet) => pet.UserId === userId),
    [pets, userId]
  );
  // Pressing the match button sends a match request from yourPets[matchFor] to filteredPetsList[displayedIndex]
  const [matchFor, setMatchFor] = useState(0);
  const [allMatchedIds, setAllMatchedIds] = useState<string[]>([]);
  const [allPendingIds, setAllPendingIds] = useState<string[]>([]);

  useEffect(() => {
    let everyMatchedIds: string[] = [];
    let everyPendingIds: string[] = [];
    const fetchAllMatches = async () => {
      const fetchMatch = async (pet: Pet) => {
        try {
          const response = await api.get<string[]>(`/pets/${pet.id}/matches?status=matched`);
          const matchedIds = response.data || [];
          console.log(`${pet.Name}'s matches: ${matchedIds}`)
          everyMatchedIds = [...everyMatchedIds, ...matchedIds];
          console.log(everyMatchedIds);
          
        } catch (error) {
          console.error(`For ${pet.id}, error occured trying to fetch matched ids: ${error}`);
        }

        try {
          const response = await api.get<string[]>(`/pets/${pet.id}/matches?status=pending`);
          const pendingIds = response.data || [];
          everyPendingIds = [...everyPendingIds, ...pendingIds];
          
        } catch (error) {
          console.error(`For ${pet.id}, error occurred trying to fetch pending ids: ${error}`);
        }
      }
      await Promise.all(yourPets.map((pet) => fetchMatch(pet)));

      setAllMatchedIds(everyMatchedIds);
      setAllPendingIds(everyPendingIds);
    }

    fetchAllMatches();
  }, [yourPets]);

  console.log("matches:" + [...allMatchedIds, ...allPendingIds]);

  const filteredPetsList = pets.filter((pet) => pet.UserId != userId)
                               .filter((pet) => [...allMatchedIds, ...allPendingIds].every((id) => pet.id != id))
                               .filter((pet) => filters.every(
                                ({ type, value }) => {
                                  if (type === "Breed" || type === "Age") {
                                    return pet[type].toString().toLowerCase().trim() === value.toString().toLowerCase().trim();
                                  }
                                  if (type === "Tag") return pet.Tag.includes(value as string);
                                }))

  const [displayedIndex, updateDisplayedIndex] = useState(0);

  useEffect(() => {
    updateDisplayedIndex((currentIndex) => {
      const newIndex = Math.floor(filteredPetsList.length / 2);
      return currentIndex < 0 || currentIndex > filteredPetsList.length - 1 ? newIndex : currentIndex;
    })
  }, [filteredPetsList]);

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
      0 <= index + direction && index + direction < pets.length
        ? index + direction
        : index,
    );
  };

  // Sends a match request to the pet at displayedIndex in filteredPetList
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const handleSubmit = async () => {
    try {
      const response = await fetch(`${baseUrl}/pets/${yourPets[matchFor].id}/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "myPetID": yourPets[matchFor].id,
          "PetId": filteredPetsList[displayedIndex].id
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

  if (isLoading) {
    return (<div>Loading</div>)
  }

  return (
    <div className={styles.overview}>
      <div className={styles["title"]}>
          <h1>Matchmaker</h1>
          <PiPawPrintFill className={styles["logo"]} />
      </div>
      <DropDown
        options={yourPets.map((pet) => pet.Name)}
        prefix="Matching for"
        className={styles["drop-down"]}
        selectedIndex={matchFor}
        onSelect={(index) => { setMatchFor(index) }}
      />
      <div className={styles["slides"]}>
        {filteredPetsList.map(({ id, Name, Age, Breed, Avatar, Tag }, index) => (
          <PetCard
            className={`${styles["card"]} ${sliderIndex(index)}`}
            key={id}
            name={Name}
            breed={Breed}
            age={parseInt(Age)}
            tags={Tag}
            image={Avatar}
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
      <MatchesPanel matchForIndex={matchFor} yourPets={yourPets} pets={pets}/>
    </div>
  );
};

export default MatchesOverview;

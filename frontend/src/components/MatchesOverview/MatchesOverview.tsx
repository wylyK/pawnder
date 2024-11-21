"use client";
import styles from "./MatchesOverview.module.css";
import PetCard from "../PetCard/PetCard";
import React, { useState } from "react";
import {
  IoIosArrowDropleft,
  IoIosArrowDropleftCircle,
  IoIosArrowDropright,
  IoIosArrowDroprightCircle,
} from "react-icons/io";
import { PiPawPrintFill } from "react-icons/pi";

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  image: string;
}

const pets: Pet[] = [
  {
    id: "1",
    name: "Fionn",
    breed: "Irish Setter + Golden Retriever",
    age: 3,
    image: "/doggo.JPG",
  },
  { id: "2", name: "Spike", breed: "Maine Coon", age: 1, image: "/dog2.avif" },
  {
    id: "3",
    name: "Luna",
    breed: "Golden Retriever",
    age: 2,
    image: "/doggo.JPG",
  },
  { id: "4", name: "Max", breed: "Labrador", age: 0.5, image: "/dog2.avif" },
  {
    id: "5",
    name: "Bella",
    breed: "Pomeranian",
    age: 67,
    image: "/catto.jpeg",
  },
  {
    id: "6",
    name: "Bill",
    breed: "Golden Retriever",
    age: 7,
    image: "/dog2.avif",
  },
];

const MatchesOverview: React.FC = () => {
  const [displayedIndex, updateDisplayedIndex] = useState(2);

  const sliderIndex = (index: number) => {
    if (index === displayedIndex) return styles["current"];
    else if (index < displayedIndex - 2)
      return `${styles["not-displayed"]} ${styles["prev-prev-prev"]}`;
    else if (index === displayedIndex - 2)
      return `${styles["back-layer"]} ${styles["prev-prev"]}`;
    else if (index === displayedIndex - 1)
      return `${styles["mid-layer"]} ${styles["prev"]}`;
    else if (index === displayedIndex + 1)
      return `${styles["mid-layer"]} ${styles["succ"]}`;
    else if (index === displayedIndex + 2)
      return `${styles["back-layer"]} ${styles["succ-succ"]}`;
    else if (index > displayedIndex + 2)
      return `${styles["not-displayed"]} ${styles["succ-succ-succ"]}`;
  };

  const slide = (direction: number) => {
    updateDisplayedIndex((index) =>
      0 <= index + direction && index + direction < pets.length
        ? index + direction
        : index,
    );
  };

  return (
    <div className={styles.overview}>
      <div className={styles["title"]}>
        <h1>Your Matches</h1>
        <PiPawPrintFill className={styles["logo"]} />
      </div>
      <div className={styles.slides}>
        {pets.map(({ id, name, breed, age, image }, index) => (
          <PetCard
            className={`${styles["card"]} ${sliderIndex(index)}`}
            key={id}
            name={name}
            breed={breed}
            age={age}
            image={image}
          />
        ))}
      </div>
      <div className={styles["buttons-container"]}>
        <div className={styles["left-arrow"]} onClick={() => slide(-1)}>
          <IoIosArrowDropleft className={styles["dormant"]} />
          <IoIosArrowDropleftCircle className={styles["hovered"]} />
        </div>
        <button className={styles["match"]}>Match</button>
        <div className={styles["right-arrow"]} onClick={() => slide(1)}>
          <IoIosArrowDropright className={styles["dormant"]} />
          <IoIosArrowDroprightCircle className={styles["hovered"]} />
        </div>
      </div>
    </div>
  );
};

export default MatchesOverview;

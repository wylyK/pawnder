"use client";
import styles from "./PetCard.module.css";
import Image from "next/image";

interface CardContent {
  id?: string,
  name: string,
  breed: string,
  age: number,
  tags: string[],
  image: string,
  className?: string,
  handlePopup?: () => void
}

const PetCard: React.FC<CardContent> = ({
  name,
  breed,
  age,
  tags,
  image,
  className,
  handlePopup,
}) => {
  return (
    <div className={`${styles.card} ${className}`} onClick={handlePopup}>
      <Image
        src={image}
        alt={name}
        width={150}
        height={150}
        className={styles.image}
      />
      <div className={styles["tags-container"]}>
        {tags.map((tag, index) =>
          (<div key={index} className={styles["tag"]}>{tag}</div>))
        }
      </div>
      <div className={styles["card-content"]}>
        <div className={styles["card-title"]}>
          <h2>{name}</h2>
          {age > -1 && <p className={styles["age"]}>{age} years</p>}
        </div>
        <p className={styles["card-subtitle"]}>{breed}</p>
      </div>
    </div>
  );
};

export default PetCard;

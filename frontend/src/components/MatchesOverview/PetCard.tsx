"use client";
import styles from "./PetCard.module.css";
import Image from "next/image";
import { Pet } from "@/share/type";

interface CardContent {
  // id?: string,
  // name: string,
  // breed: string,
  // age: number,
  // tags: string[],
  // image: string,
  petRecord: Pet,
  className?: string,
  handlePopup?: () => void
}

const PetCard: React.FC<CardContent> = ({
  // name,
  // breed,
  // age,
  // tags,
  // image,
  petRecord,
  className,
  handlePopup,
}) => {

  return (
    <div className={`${styles.card} ${className}`} onClick={handlePopup}>
        <div key={petRecord.Id}>
          <Image
            src={petRecord.Avatar || "/default_user.jpg"}
            alt={petRecord.Name}
            width={150}
            height={150}
            sizes="100vw"
            className={styles.image}
          />
          <div className={styles["tags-container"]}>
            {/* {petRecord.Tag && petRecord.Tag.map((tag, index) =>
              (<div key={index} className={styles["tag"]}>{tag}</div>))
            } */}
          </div>
          <div className={styles["card-content"]}>
            <div className={styles["card-title"]}>
              <h2>{petRecord.Name}</h2>
              {petRecord.Age > -1 && <p className={styles["age"]}>{petRecord.Age} years</p>}
            </div>
            <p className={styles["card-subtitle"]}>{petRecord.Breed}</p>
          </div>
        </div>
    </div>
  );
};

export default PetCard;

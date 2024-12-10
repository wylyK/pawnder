import React from "react"
import styles from "./PanelEntryPopup.module.css"
import Modal from "./Modal"
import { PetPair } from "./MatchesPanel"

interface PanelEntryProps {
    pair: PetPair | null
    popupType: PopupType
    handleClosePopup: () => void
}

type PopupType = "None" | "Incoming" | "Match" 

const PanelEntryPopup: React.FC<PanelEntryProps> = ({ pair, popupType, handleClosePopup }) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const acceptRequest = async () => {
        try {
            const response = await fetch(`${baseUrl}/pets/${(pair as PetPair).userPet.id}/matches?action=accept`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                "PetId": (pair as PetPair).matePet.id 
              })
          });
      
            if (response.ok) {
              console.log("Accepted Match Request!");
            } else {
              const errorData = await response.json();
              console.log(errorData.error || "Failed to accept request. Please try again.");
            }
          } catch (err) {
            console.error("Error occurred when trying accept request:", err);
          }
    }

    const rejectRequest = async () => {
        try {
            const response = await fetch(`${baseUrl}/pets/${(pair as PetPair).userPet.id}/matches?action=reject`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                "PetId": (pair as PetPair).matePet.id 
              })
          });
      
            if (response.ok) {
              console.log("Rejected Match Request!");
            } else {
              const errorData = await response.json();
              console.log(errorData.error || "Failed to reject request. Please try again.");
            }
          } catch (err) {
            console.error("Error occurred when trying reject request:", err);
          }
    }

    const unmatch = async () => {
        try {
            const response = await fetch(`${baseUrl}/pets/${(pair as PetPair).userPet.id}/matches?action=unmatch`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                "PetId": (pair as PetPair).matePet.id 
              })
          });
      
            if (response.ok) {
              console.log("Removed Match!");
            } else {
              const errorData = await response.json();
              console.log(errorData.error || "Failed to delete match. Please try again.");
            }
          } catch (err) {
            console.error("Error occurred when trying delete match:", err);
          }
    }

    return (
    popupType != "None" && (
    <Modal className={styles.popup} onClose={handleClosePopup}>
        <div className={styles["image-container"]}>
            <img 
                src={(pair as PetPair).matePet.Avatar}
                alt={(pair as PetPair).matePet.Name}
            />
        </div>
        <div className={styles.content}>
            <p className={styles.title}>
                {(pair as PetPair).matePet.Name}
            </p>
            <p className={styles.subtitle}>
                {(pair as PetPair).matePet.Breed}
                {parseInt((pair as PetPair).matePet.Age) > -1 && <p className={styles["age"]}>{(pair as PetPair).matePet.Age} years</p>}
            </p>
            <p className={styles.description}>{(pair as PetPair).matePet.Description}</p>
            <div className={styles["buttons-container"]}>
                { popupType === "Incoming" && 
                    <div className={styles["decision-buttons"]}>
                        <button className={styles.accept} onClick={() => {acceptRequest(); handleClosePopup()}}>Accept</button>
                        <button className={styles.reject} onClick={() => {rejectRequest(); handleClosePopup()}}>Reject</button>
                    </div>
                }
                { popupType === "Match" && 
                    <button className={styles.remove} onClick={() => {unmatch(); handleClosePopup()}}>Remove</button>
                }
            </div>
        </div>
    </Modal>))
}

export default PanelEntryPopup
export type { PopupType }
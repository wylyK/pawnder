import React, { useEffect, useState } from "react"
import styles from "./MatchesPanel.module.css"
import PanelEntryPopup, { PopupType } from "./PanelEntryPopup"
import api from "../../../api";
import { MdOutlineArrowLeft } from "react-icons/md";

interface PanelProps {
    matchForIndex: number
    yourPets: Pet[]
    pets: Pet[]
}

interface Pet {
    id: string
    Name: string
    Age: string
    Breed: string
    Avatar: string
    Description: string
    UserId: string
  }

  interface PetPair {
    matePet: Pet
    userPet: Pet
}

interface Match {
    pair: PetPair
    sender: string
    recipient: string
}

interface Popup {
    pair: PetPair | null
    popupType: PopupType
}

type Tab = "Pending" | "Paw Mates"

const MatchesPanel: React.FC<PanelProps> = ({ matchForIndex, yourPets, pets }) => {
    const [tab, setTab] = useState<Tab>("Pending");
    const [pendingList, updatePendingList] = useState<Match[]>([]);
    const [pawMates, updatePawMates] = useState<Match[]>([]);

    useEffect(() => {
        const fetchPendingList = async () => {
          try {
            console.log(matchForIndex);
            const response = await api.get<string[]>(`/pets/${yourPets[matchForIndex].id}/matches?status=pending`);
            const matchIds = response.data || [];
            const newPendingList = pets.filter((pet) => matchIds.includes(pet.id))
                                       .map((pet) => { return { 
                                                        pair: { matePet: pet, userPet: yourPets[matchForIndex] },
                                                        sender: pet.UserId,
                                                        recipient: yourPets[matchForIndex].UserId
                                                    }});
            updatePendingList(newPendingList);
          } catch (error) {
            console.error("Error fetching pets:", error);
          }
        };
    
        fetchPendingList();
      }, [matchForIndex, yourPets, pets]);

    useEffect(() => {
        const fetchPawMates = async() => {
            try {
                const response = await api.get<string[]>(`/pets/${yourPets[matchForIndex].id}/matches?status=matched`);
                const matchIds = response.data || []
                const newPawMates = pets.filter((pet) => matchIds.includes(pet.id))
                                       .map((pet) => { return { 
                                                        pair: { matePet: pet, userPet: yourPets[matchForIndex] },
                                                        sender: pet.UserId,
                                                        recipient: yourPets[matchForIndex].UserId
                                                    }})
                updatePawMates(newPawMates);
            } catch (error) {
                console.error("Error fetching pets:", error);
            }}

            fetchPawMates();
}, [matchForIndex, yourPets, pets]);

    const closedPopup: Popup = { pair: null, popupType: "None"};
    const [popup, setPopup] = useState<Popup>(closedPopup);

    return (
        <>
            <div className={styles["panel-container"]}>
                <div className={styles.arrow}>
                    <MdOutlineArrowLeft/>
                </div>
                <div className={styles.panel}>
                    <div className={styles.tabs}>
                        <button className={`${tab === "Pending"   && styles.selected}`} onClick={() => {setTab("Pending")}}>Pending</button>
                        <button className={`${tab === "Paw Mates" && styles.selected}`} onClick={() => {setTab("Paw Mates")}}>Paw Mates</button>
                    </div>
                    <div className={styles["entries-list"]}>
                        { tab === "Pending" && pendingList.map((request, index) => { 
                        return (
                        <div
                            key={index}
                            className={styles["entry-container"]}
                        >
                            <div
                                className={`${styles.entry}
                                            ${styles["incoming-request"]}`}
                                onClick={() => {setPopup({ pair: request.pair, popupType: "Incoming" })}}
                            >
                            <p className={styles["body-text"]}>
                                <p className={styles["body-text"]}>
                                        <span className={styles["normal-text"]}>wants to match with </span>
                                        <b>{request.pair.userPet.Name}</b>
                                </p>
                            </p>
                            <p className={styles["emphasized-text"]}>{request.pair.matePet.Name}</p>
                            </div>
                        </div>)})}
                        { tab === "Paw Mates" && pawMates.map((match, index) => (
                        <div
                            key={index}
                            className={styles["entry-container"]}
                        >
                            <div
                                className={`${styles.entry} ${styles.matches}`}
                                onClick={() => { setPopup( {pair: match.pair, popupType: "Match"} ) }}
                            >
                                <p className={styles["emphasized-text"]}>{match.pair.matePet.Name}</p>
                                <p className={styles["body-text"]}>
                                    <span className={styles["normal-text"]}>matched with </span>
                                    <b>{match.pair.userPet.Name}</b>
                                </p>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
            <PanelEntryPopup
                pair={popup.pair}
                popupType={popup.popupType}
                handleClosePopup={() => { setPopup(closedPopup)}}
            />
        </>
    )
}

export default MatchesPanel
export type { PetPair }
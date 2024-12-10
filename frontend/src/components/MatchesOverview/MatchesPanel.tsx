import React, { useEffect, useState } from "react"
import styles from "./MatchesPanel.module.css"
import PanelEntryPopup, { PopupType } from "./PanelEntryPopup"
import api from "../../../api";
import { MdOutlineArrowLeft } from "react-icons/md";
import { Pet } from "@/share/type";
import { usePetsByPetIds } from "@/hooks/use-pets-by-pet-ids";

interface PanelProps {
    myPetIds: string[]
    myPets: Record<string, Pet>
}

interface PetPair {
    petId: string
    myPetId: string
}

interface Popup {
    pair: PetPair | null
    popupType: PopupType
}

type Tab = "Pending" | "Paw Mates"

const MatchesPanel: React.FC<PanelProps> = ({ myPetIds, myPets }) => {
    const [tab, setTab] = useState<Tab>("Pending");
    const [matchedList, updateMatchedList] = useState<PetPair[]>([]);
    const [pendingList, updatePendingList] = useState<PetPair[]>([]);
    const [allMatchedIds, setAllMatchedIds] = useState<string[]>([]);
    const [allPendingIds, setAllPendingIds] = useState<string[]>([]);

    useEffect(() => {
        let everyMatchedIds: string[] = [];
        let everyPendingIds: string[] = [];
        let newMatchedList: PetPair[] = [];
        let newPendingList: PetPair[] = [];
        const fetchAllMatches = async () => {
          const fetchMatches = async (id: string) => {
            try {
              const response = await api.get<string[]>(`/pets/${id}/matches?status=matched`);
              const matchedIds = response.data || [];
              everyMatchedIds = [...everyMatchedIds, ...matchedIds];
              newMatchedList = [...newMatchedList, ...matchedIds.map((mateId) => { return { petId: mateId, myPetId: id }})]
              
            } catch (error) {
              console.error(`For ${id}, error occured trying to fetch matched ids: ${error}`);
            }
    
            try {
              const response = await api.get<string[]>(`/pets/${id}/matches?status=pending`);
              const pendingIds = response.data || [];
              everyPendingIds = [...everyPendingIds, ...pendingIds];
              newPendingList = [...newPendingList, ...pendingIds.map((mateId) => { return { petId: mateId, myPetId: id }})]
              
            } catch (error) {
              console.error(`For ${id}, error occurred trying to fetch pending ids: ${error}`);
            }
          }
          await Promise.all(myPetIds.map(fetchMatches));
    
          setAllMatchedIds(everyMatchedIds);
          setAllPendingIds(everyPendingIds);
          updateMatchedList(newMatchedList);
          updatePendingList(newPendingList);
        }
    
        fetchAllMatches();
      }, [myPetIds]);

    const allMatchedPets = usePetsByPetIds(allMatchedIds).pets;
    const allPendingPets = usePetsByPetIds(allPendingIds).pets;

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
                        { tab === "Pending" && pendingList.map((pair, index) => { 
                        return (
                        <div
                            key={index}
                            className={styles["entry-container"]}
                        >
                            <div
                                className={`${styles.entry}
                                            ${styles["incoming-request"]}`}
                                onClick={() => {setPopup({ pair: pair, popupType: "Incoming" })}}
                            >
                            <p className={styles["body-text"]}>
                                <p className={styles["body-text"]}>
                                        <span className={styles["normal-text"]}>wants to match with </span>
                                        <b>{myPets[pair.myPetId].Name}</b>
                                </p>
                            </p>
                            <p className={styles["emphasized-text"]}>{allPendingPets[pair.petId].Name}</p>
                            </div>
                        </div>)})}
                        { tab === "Paw Mates" && matchedList.map((pair, index) => (
                        <div
                            key={index}
                            className={styles["entry-container"]}
                        >
                            <div
                                className={`${styles.entry} ${styles.matches}`}
                                onClick={() => { setPopup( {pair: pair, popupType: "Match"} ) }}
                            >
                                <p className={styles["emphasized-text"]}>{allMatchedPets[pair.petId].Name}</p>
                                <p className={styles["body-text"]}>
                                    <span className={styles["normal-text"]}>matched with </span>
                                    <b>{myPets[pair.myPetId].Name}</b>
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
"use client";
import { AiOutlinePlus } from "react-icons/ai";
import addstyles from "./AddCard.module.css";
import cardstyles from "./PetCard.module.css"


const AddCard: React.FC = () => {
  return (
    <div className={`${cardstyles.card} ${addstyles["add-card"]}`}>
        <AiOutlinePlus size={50} color="#555" />
        <p>Add Pet</p>
    </div>
  );
};

export default AddCard;

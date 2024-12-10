import React, { useState } from "react"
import {Filter, FilterType} from "./FilterList"
import styles from "./FilterPopup.module.css"
import Modal from "./Modal"

interface FilterPopupProps {
    handleClosePopup: () => void
    addFilter: (filter: Filter) => void 
}

const FilterPopup: React.FC<FilterPopupProps> = ({ handleClosePopup, addFilter }) => {
    const [tab, setTab] = useState<FilterType>("Breed");
    const [inputValue, setInputValue] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const value = inputValue.trim();
        if (value) {
            addFilter({ type: tab, value: value });
            setInputValue("");
            handleClosePopup();
        }
    }

    return (
        <Modal className={styles["popup"]} onClose={handleClosePopup}>
            <h1>New Filter</h1>
            <form className={styles["content"]} onSubmit={handleSubmit}>
                <div className={styles["tabs"]}>
                    {["Breed", "Age", "Tag"].map((tabName, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`${styles["tab"]} ${tab === tabName && styles["selected"]}`}
                            onClick={() => {setTab(tabName as FilterType)}}>{tabName}
                        </button>
                    ))}
                </div>
                <input
                    className={styles["field"]}
                    type={tab === "Age" ? "number" : "text"}
                    placeholder={`Enter ${tab[0].toUpperCase() + tab.slice(1)}`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <button className={styles["add-filter"]} type="submit">Add Filter</button>
            </form>
        </Modal>
    )
}

export default FilterPopup
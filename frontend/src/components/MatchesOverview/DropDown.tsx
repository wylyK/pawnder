import React, { useState } from "react"
import styles from "./DropDown.module.css"
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";

interface DropDownProp {
    options: string[]
    prefix: string
    className: string
    selectedIndex: number;
    onSelect: (index: number) => void
}

const DropDown: React.FC<DropDownProp> = ({ options, prefix, className, selectedIndex, onSelect }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className={`${styles.select} ${className}`}>
            <div className={styles.bar}>
                { (prefix + " ") + options[selectedIndex]}
                <button className={styles["arrow"]} onClick={() => {setExpanded((p) => !p)}}>
                    {!expanded && <FaAngleDown className={styles.retracted}/>}
                    {expanded && <FaAngleUp className={styles.expanded}/>}
                </button>
            </div>
            {expanded &&
            <div className={styles.menu}>
                {options.map((option, index) => (
                <div key={index} className={`${styles.option}`}
                                 onClick={() => {
                                    setExpanded(false)
                                    onSelect(index)
                                 }
                }>
                    {option}
                </div>))}
            </div>}
        </div>
    )
}

export default DropDown;
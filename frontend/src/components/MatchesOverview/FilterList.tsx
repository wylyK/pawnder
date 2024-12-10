import React, { useState } from "react"
import styles from "./FilterList.module.css"
import { RxCross2, RxPlus } from "react-icons/rx";
import FilterPopup from "./FilterPopup";

interface FiltersListProps {
    onFiltersUpdate: (filters: Filter[]) => void
}

interface Filter {
    type: FilterType
    value: string | number
}

type FilterType = "Breed" | "Age" | "Tag";

const FilterList: React.FC<FiltersListProps> = ({ onFiltersUpdate }) => {
    const [filters, updateFilters] = useState<Filter[]>([]);
    const [popupIsActive, setPopupActivity] = useState(false);

    const addFilter = (newFilter: Filter) => {
        const newFilters = [...filters, newFilter];
        updateFilters(newFilters);
        onFiltersUpdate(newFilters);
    }

    const deleteFilter = (index: number) => {
        const newFilters = filters.filter((_, i) => i != index);
        updateFilters(newFilters);
        onFiltersUpdate(newFilters);
    }

    return (
        <div className={styles["filter-list"]}>
            {filters.map((filter, index) => (
                <div
                    key={index}
                    className={`${styles["filter"]} ${styles[filter.type]}`}   
                >
                    {filter.value + (filter.type === "Age" ? " years" : "")}
                    <RxCross2 className={styles["cross-icon"]} onClick={() => {deleteFilter(index)}}/>
                </div>
            ))}
            <div className={`${styles["filter"]} ${styles["add"]}`} onClick={() => {setPopupActivity(true)}}>
                <RxPlus className={styles["plus-icon"]}/>
                Filter
            </div>
            { popupIsActive &&
                <FilterPopup handleClosePopup={ () => {setPopupActivity(false)} } addFilter={addFilter}/>
            }
        </div>
    )
}

export default FilterList
export type { Filter, FilterType }
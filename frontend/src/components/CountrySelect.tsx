import Select from "react-select";
import countryList from 'react-select-country-list';
import { CountryOption } from '@/share/type';

interface CountrySelectProp {
  value: CountryOption | null;
  onChange: (option: CountryOption | null) => void;
  disabled?: boolean;
}

export default function CountrySelect({value, onChange, disabled}: CountrySelectProp) {
    const options = countryList().getData(); 
  
    return (
      <div className="flex flex-col my-5">
        <label className="text-md font-bold p-2">Country/Region</label>
        <Select
          value={value}
          onChange={onChange} 
          options={options} 
          isDisabled={disabled}
          className="w-full " 
          styles={{
            control: (provided) => ({
              ...provided,
              padding: "0.4rem", 
              borderRadius: "0.375rem",
              borderColor: "black-200", 
              fontSize: "1rem", 
              backgroundColor: "#ffffff",
            }),
            option: (provided, state) => ({
              ...provided,
              padding: "10px", 
              backgroundColor: state.isSelected ? "#F3F4F6" : state.isFocused ? "#FFDDD2" : "#ffffff", 
              color: state.isSelected ? "#111827" : "#FF7578", 
              fontSize: "1rem", 
            }),
          }}
        />
      </div>
    );
  }
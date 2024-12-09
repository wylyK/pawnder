"use client";

import React from "react";

interface ProfileTextBoxProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    disabled?: boolean;
}

export default function ProfileTextBox({
    label,
    value,
    onChange,
    disabled,
}: ProfileTextBoxProps) {
    return (
        <form className="flex flex-col my-2">
            <label className="text-md font-bold p-2">{label}</label>
            <select 
                value={value} 
                onChange={onChange}
                disabled={disabled}
                className="p-3 pr-36 rounded-md bg-white border border-black-200"
            >
                <option value="" disabled hidden>
                    Select Role
                </option>
                <option value="Owner">Pet Owner</option>
                <option value="Vet">Veterinarian</option>
            </select>
        </form>
    );
}

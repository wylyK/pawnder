"use client"

import React from "react";

interface ProfileTextBoxProps {
    label: string;
    type: string; 
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export default function ProfileTextBox({ label, type, value, onChange, disabled}: ProfileTextBoxProps) {
    return (
        <form className="flex flex-col my-2">
            <label className="text-md font-bold p-2">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="p-3 pr-36 rounded-md bg-white border border-black-200"
            />
        </form>
    );
}

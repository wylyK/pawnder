"use client";

import React from "react";

interface ProfileTextBoxProps {
  label: string;
  type: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  accept?: string;
}

export default function ProfileTextBox({
  label,
  type,
  value,
  onChange,
  disabled,
  accept,
}: ProfileTextBoxProps) {
  return (
    <form className="flex flex-col my-2">
      <label className="text-md font-bold p-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        accept={accept}
        className="p-3 pr-36 rounded-md bg-white border border-black-200"
      />
    </form>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SingleValue } from "react-select";
import ProfileTextBox from "../ProfileTexBox";
import { CountryOption } from "@/share/type";
import CountrySelect from "../CountrySelect";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [birthValue, setBirthValue] = useState("1995-05-23");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(
    null,
  );

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleNameValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(e.target.value);
  };

  const handleEmailValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailValue(e.target.value);
  };

  const handlePasswordValueChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPasswordValue(e.target.value);
  };

  const handleBirthValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthValue(e.target.value);
  };

  const handleCountryChange = (
    newValue: SingleValue<{ value: string; label: string }> | null,
  ) => {
    setSelectedCountry(newValue);
  };

  return (
    <div className="flex">
      <div className="flex pl-36 pt-12 ">
        <h1 className="text-5xl text-pink-rose font-bold">Pet</h1>
        <h1 className="text-5xl ml-2 text-brown-red font-semibold">life</h1>
      </div>
      <div className="flex flex-col">
        <div className="flex bg-white mt-12 py-6 p-8 m-6 mx-64 rounded-3xl">
          <div className="mx-12">
            <Image src="/Avatar.png" alt="Avatar" width={200} height={200} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Hi name!</h1>
            <p>Updated date: April 6, 2023</p>
            <ProfileTextBox
              label="Name"
              type="text"
              value={nameValue}
              onChange={handleNameValueChange}
              disabled={!isEditing}
            />
            <ProfileTextBox
              label="Email"
              type="email"
              value={emailValue}
              onChange={handleEmailValueChange}
              disabled={!isEditing}
            />
            <ProfileTextBox
              label="Password"
              type="password"
              value={passwordValue}
              onChange={handlePasswordValueChange}
              disabled={!isEditing}
            />
            <ProfileTextBox
              label="Date of birth"
              type="date"
              value={birthValue}
              onChange={handleBirthValueChange}
              disabled={!isEditing}
            />
            <CountrySelect
              value={selectedCountry}
              onChange={handleCountryChange}
              disabled={!isEditing}
            />
          </div>
        </div>
        <div className="ml-64">
          <button
            className="bg-pink-rose text-white text-xl font-semibold p-2 px-10 rounded-md"
            onClick={handleEditClick}
          >
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>
      </div>
    </div>
  );
}

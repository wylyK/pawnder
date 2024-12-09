"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import ProfileTextBox from "../ProfileTextBox";
import { useAuth } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import ProfileSelectBox from "../ProfileSelectBox";
import { useUser } from "@/hooks/use-user";
import { Role, User } from "@/share/type";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [fnameValue, setFNameValue] = useState("");
  const [lnameValue, setLNameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [roleValue, setRoleValue] = useState<Role>(Role.Owner);
  const [locationValue, setLocationValue] = useState("");
  const [avatarValue, setAvatarValue] = useState<File | undefined>(undefined);
  const { updateUser } = useUser();

  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user !== null) {
      return;
    }
    router.push("/login");
  }, [user, router]);

  useEffect(() => {
    if (user) {
      setFNameValue(user.FName);
      setLNameValue(user.LName);
      setEmailValue(user.Email);
      setRoleValue(user.Role);
      setLocationValue(user.Location || "");
      setAvatarValue(user.Avatar || undefined);
    }
  }, [user]);

  const handleUpdateUser = () => {
    const updatedUser: User = {
      Id: user?.Id || "",
      FName: fnameValue,
      LName: lnameValue,
      Email: emailValue,
      Role: roleValue,
      Location: locationValue,
      Avatar: avatarValue,
    };
    updateUser(
      {
        updatedUser,
      },
      {
        onSuccess: () => {
          console.log("User updated successfully");
          setIsEditing((prev) => !prev);
        },
        onError: (error) => {
          console.error("Error updating user", error);
        },
      },
    );
  };

  const handleEditClick = () => {
    setIsEditing((prev) => !prev);
  };

  const handleFNameValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFNameValue(e.target.value);
  };

  const handleLNameValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLNameValue(e.target.value);
  };

  const handleEmailValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailValue(e.target.value);
  };

  const handleRoleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleValue(e.target.value as Role);
  };

  const handleLocationValueChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLocationValue(e.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarValue(file);
    }
  };

  return (
    <div className="flex pb-10">
      <div className="flex pl-24 pt-12">
        <h1 className="text-5xl text-pink-rose font-bold">Pet</h1>
        <h1 className="text-5xl ml-2 text-brown-red font-semibold">life</h1>
      </div>
      <div className="flex flex-col">
        <div className="flex bg-white mt-12 py-6 p-8 m-6 mx-64 rounded-3xl">
          <div className="rounded-full overflow-hidden w-[150px] h-[150px] mr-8 border-4 border-pink-rose shadow-lg">
            <Image
              src={
                typeof avatarValue === "string"
                  ? avatarValue
                  : avatarValue
                    ? URL.createObjectURL(avatarValue)
                    : "/frontend/public/default_user.jpg"
              }
              alt="Avatar"
              width={150}
              height={150}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              Hi, {fnameValue} {lnameValue}
            </h1>
            <ProfileTextBox
              label="First Name"
              type="text"
              value={fnameValue}
              onChange={handleFNameValueChange}
              disabled={!isEditing}
            />
            <ProfileTextBox
              label="Last Name"
              type="text"
              value={lnameValue}
              onChange={handleLNameValueChange}
              disabled={!isEditing}
            />
            <ProfileTextBox
              label="Email"
              type="email"
              value={emailValue}
              onChange={handleEmailValueChange}
              disabled={true}
            />
            <ProfileSelectBox
              label="Role"
              value={roleValue}
              onChange={handleRoleValueChange}
              disabled={true}
            />
            <ProfileTextBox
              label="Location"
              type="text"
              value={locationValue}
              onChange={handleLocationValueChange}
              disabled={!isEditing}
            />
            <ProfileTextBox
              label="Upload Avatar"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={!isEditing}
            />
          </div>
        </div>
        <div className="ml-64 flex gap-4">
          <button
            className="bg-pink-rose text-white text-xl font-semibold p-2 px-10 rounded-md"
            onClick={handleEditClick}
          >
            Edit
          </button>
          {isEditing && (
            <button
              className="bg-pink-rose text-white text-xl font-semibold p-2 px-10 rounded-md"
              onClick={handleUpdateUser}
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

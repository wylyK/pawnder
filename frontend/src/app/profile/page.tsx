import React from "react";
import NavBar from "../../components/Navigation/NavBar";
import UserProfile from "@/components/UserProfile/UserProfile";
import "../globals.css";

export default function UserProfilePage() {
  return (
    <>
      <NavBar />
      <UserProfile />
    </>
  );
}

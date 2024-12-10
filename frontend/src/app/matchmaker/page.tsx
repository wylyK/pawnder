import React from "react";
import NavBar from "../../components/Navigation/NavBar";
import MatchesOverview from "@/components/MatchesOverview/MatchesOverview";
import "../globals.css";

export default function UserProfilePage() {
  return (
    <>
      <NavBar />
      <MatchesOverview />
    </>
  );
}

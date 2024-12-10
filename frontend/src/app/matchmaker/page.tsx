import React from "react";
import "../globals.css";
import MatchesOverview from "@/components/MatchesOverview/MatchesOverview";
import NavBar from "@/components/Navigation/NavBar";

const MatchMakerPage = () => {
  return (
  <>
    <NavBar/>
    <MatchesOverview/>
  </>
  )
}

export default MatchMakerPage;
"use client"

import React, { useEffect } from "react";
import NavBar from "../../components/Navigation/NavBar";
import MatchesOverview from "@/components/MatchesOverview/MatchesOverview";
import "../globals.css";
import { useAuth } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function MatchMakerPage() {
  const { user } = useAuth(); // Get user details from context
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login"); // Redirect to login if no user is logged in
    }
  }, [user, router]);

  if (!user) {
    return <div>Loading...</div>; // Show a loading state while waiting for authentication
  }
  return (
    <>
      <NavBar />
      <MatchesOverview />
    </>
  );
}

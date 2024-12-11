// app/page.tsx
"use client";

import React, { useEffect } from "react";
import HomePage from "../components/Home/Home";
import VetHomePage from "../components/VetPage/VetHomePage"; // Import VetHomePage
import LoadingScreen from "../components/LoadingScreen/LoadingScreen" // Import Loading Screen
import { useAuth } from "@/context/UserContext"; // Import authentication context
import { useRouter } from "next/navigation";
import "./globals.css";


const Page: React.FC = () => {
  const { user } = useAuth(); // Get user details from context
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login"); // Redirect to login if no user is logged in
    }
  }, [user, router]);

  if (!user) {
    return <LoadingScreen/>; // Show a loading state while waiting for authentication
  }

  return (
    <>
      {user?.Role === "Owner" && <HomePage />}
      {user?.Role === "Vet" && <VetHomePage />}
    </>
  );
};

export default Page;

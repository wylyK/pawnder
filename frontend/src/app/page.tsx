// app/page.tsx
import React from "react";
import HomePage from "../components/Home/Home";
import { UserProvider } from "@/context/UserContext";
import "./globals.css";

const Page: React.FC = () => {
  return (
    <UserProvider>
      <HomePage />
    </UserProvider>
  );
};

export default Page;

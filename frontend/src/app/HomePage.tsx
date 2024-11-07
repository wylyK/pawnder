//Homepage.tsx
import React, { CSSProperties } from "react";
import NavBar from "../components/Navigation/NavBar";
import PetOverview from "../components/PetOverview/PetOverview";
import { FaPaw } from "react-icons/fa"; // Import paw icon
import Reminders from "@/components/Reminder/Reminders";
//import PetProfile from "@/components/PetProfile/PetProfile";

const HomePage: React.FC = () => {
  return (
    <div style={containerStyle}>
      <NavBar />
      <main style={mainStyle}>
        {/* Header section with logo */}
        <div style={headerStyle}>
          <h1 style={headingStyle}>Your Pets</h1>
          <div style={logoStyle}>
            <FaPaw size={30} color="#555" style={{ marginRight: "8px" }} />
            <span style={titleStyle}>Pawnder</span>
          </div>
        </div>
        <div style={cardContainerStyle}>
          <PetOverview />
        </div>
      </main>
      <Reminders/>
    </div>
  );
};

// CSS styles
const containerStyle: CSSProperties = {
  display: "flex",
  height: "100vh",
  overflowX: "hidden",
  width: "100%",
};

const mainStyle: CSSProperties = {
  marginLeft: "80px",
  padding: "20px",
  width: "calc(100% - 80px)",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
  paddingRight: "30px",
};

const headingStyle: CSSProperties = {
  fontSize: "3rem",
  fontWeight: 550,
  marginBottom: "0px",
  marginLeft: "30px",
};

const logoStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const titleStyle: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: "#555",
  marginRight: "20px"
};

const cardContainerStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
  marginTop: "20px",
  overflowX: "auto", // Allow horizontal scrolling for pets
  width: "100%", // Ensure it fills the width
};

export default HomePage;

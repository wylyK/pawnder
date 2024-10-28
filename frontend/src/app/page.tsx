import React, { CSSProperties } from "react";
import NavBar from "../components/Navigation/NavBar";
import PetOverview from "../components/PetOverview/PetOverview";

// Home page component
const Page: React.FC = () => {
  return (
    <div style={containerStyle}>
      <NavBar />
      <main style={mainStyle}>
        <h1 style={headingStyle}> Your Pets</h1>
        <div style={cardContainerStyle}>
          <PetOverview />
        </div>
      </main>
    </div>
  );
};

// CSS styles
const containerStyle: CSSProperties = {
  display: "flex",
  height: "100vh",
};

const mainStyle: CSSProperties = {
  marginLeft: "80px",
  padding: "20px",
  width: "100%",
};

const cardContainerStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
  marginTop: "20px",
};

const headingStyle: CSSProperties = {
  fontSize: "2rem", // Adjust size as needed
  fontWeight: "bold",
  marginBottom: "20px",
};


export default Page;

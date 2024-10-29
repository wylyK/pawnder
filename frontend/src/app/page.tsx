import React from "react";
import NavBar from "../components/Navigation/NavBar";

export default function Home() {
  return (
    <div style={containerStyle}>
      <NavBar />
      <main style={mainStyle}>
        <h1>Welcome to Pawnder</h1>
      </main>
    </div>
  );
}

const containerStyle = {
  display: "flex", // Flexbox to place NavBar and main content side by side
  height: "100vh", // Full viewport height
};

const mainStyle = {
  marginLeft: "80px",
  padding: "20px",
  width: "100%",
};

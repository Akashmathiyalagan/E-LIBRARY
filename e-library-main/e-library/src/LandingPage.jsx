import React, { useEffect, useState } from "react";
import "./LandingPage.css";
import { useNavigate } from "react-router-dom";
import appImage from "./assets/logo.png";

const Landing = () => {
  const navigate = useNavigate();
  const [appImage, setAppImage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/get_app_image")
      .then((res) => res.json())
      .then((data) => {
        if (data.image_url) {
          setAppImage(data.image_url);
        }
      })
      .catch((err) => console.error("Error fetching app image:", err));
  }, []);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      background: "linear-gradient(to right, #4a1e07, #7a3e1d)",
      color: "white",
    }}>
      {/* Display App Logo */}
      {appImage && <img src={appImage} alt="App Logo" className="logo" />}
      
      {/* Quote Section */}
      <h1 className="quote">
        "A room without books is like a body without a soul."
      </h1>
      <p className="quote-author">— Marcus Tullius Cicero</p>

      {/* Buttons for Author & User Login */}
      <div className="button-container">
        <button className="btn btn-author" onClick={() => navigate("/AuthorLogin")}>
          Author Login
        </button>
        <button className="btn btn-user" onClick={() => navigate("/login-register")}>
          User Login
        </button>
      </div>
    </div>
  );
};

export default Landing;

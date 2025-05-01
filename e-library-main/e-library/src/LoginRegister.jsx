import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./LoginRegister.css";

const LoginRegister = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setError(data.error || "Invalid email or password!");
      }
    } catch (err) {
      setError("Error connecting to the server.");
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const username = event.target.username.value;
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Registration successful! You can now log in.");
        event.target.reset();
      } else {
        setError(data.error || "Registration failed!");
      }
    } catch (err) {
      setError("Error connecting to the server.");
    }
  };

  const backgroundStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtReU98b-aS4kOvEeEG6Hi48wybHwhXgWNMw&s')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
  };

  return (
    <div style={backgroundStyle}>
      <div className="book-container">
        <div className="page left-page">
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <input type="text" className="input-field" name="username" placeholder="Full Name" required />
            <input type="email" className="input-field" name="email" placeholder="Email" required />
            <input type="password" className="input-field" name="password" placeholder="Password" required />
            <button type="submit" className="button">Register</button>
          </form>
          {success && <p className="success-text">{success}</p>}
          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="page right-page">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input type="email" className="input-field" name="email" placeholder="Enter Email" required />
            <input type="password" className="input-field" name="password" placeholder="Enter Password" required />
            <button type="submit" className="button">Login</button>
          </form>
          {error && <p className="error-text">{error}</p>}
          <p className="toggle-text">Forgot Password?</p>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;

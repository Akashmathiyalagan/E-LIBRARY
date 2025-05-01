import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AuthorLogin.css";

const AuthorLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/authors/login", { email, password });

            // Store author token & email
            localStorage.setItem("authorToken", response.data.token);
            localStorage.setItem("authorEmail", email); // Store email for filtering books

            navigate("/PublisherDashboard"); // Redirect after login
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password.");
        }
    };

    return (
        <div className="auth-container">
            <h2>Author Login</h2>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={handleLogin}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Login</button>
            </form>
            <div className="register">
                <p>Don't have an account? <a href="/AuthorRegister">Register here</a></p>
            </div>
        </div>
    );
};

export default AuthorLogin;

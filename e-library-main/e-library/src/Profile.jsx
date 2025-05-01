import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
    const [user, setUser] = useState({
        name: "",
        email: "",
        profilePicture: "",
        favoriteAuthors: [],
        purchasedBooks: [],
        rentedBooks: [],
        preferredLanguage: "",
        transactions: []
    });

    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        axios.get("/api/user-profile")
            .then(response => {
                setUser({
                    ...response.data,
                    purchasedBooks: response.data.purchasedBooks || [],
                    rentedBooks: response.data.rentedBooks || [],
                    transactions: response.data.transactions || []
                });
            })
            .catch(error => console.error("Error fetching user profile:", error));
    }, []);

    const handleLanguageChange = (e) => {
        setUser(prev => ({ ...prev, preferredLanguage: e.target.value }));
    };

    const handleProfilePictureUpload = (e) => {
        const file = e.target.files[0];
        setProfileImage(file);

        const formData = new FormData();
        formData.append("profilePicture", file);

        axios.post("/api/upload-profile-picture", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        .then(response => {
            setUser(prev => ({ ...prev, profilePicture: response.data.profilePicture }));
        })
        .catch(error => console.error("Error uploading profile picture:", error));
    };

    const handleSubmit = () => {
        axios.post("/api/update-user-profile", user)
            .then(response => {
                alert("Profile updated successfully!");
                setUser(response.data);
            })
            .catch(error => console.error("Error updating profile:", error));
    };

    return (
        <div className="profile-container">
            {/* Left Side */}
            <div className="profile-left">
                <h2>Profile</h2>
                <div className="profile-card">
                    <div className="user-details">
                        <p className="user-name"><strong>{user.name}</strong></p>
                        <div className="profile-picture">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" />
                            ) : (
                                <p>No Profile Picture</p>
                            )}
                            <input type="file" accept="image/*" onChange={handleProfilePictureUpload} />
                        </div>
                        <p className="user-email">{user.email}</p>
                    </div>

                    <div className="favorite-authors">
                        <h3>Favorite Authors</h3>
                        <ul>
                            {user.favoriteAuthors?.length > 0 ? (
                                user.favoriteAuthors.map((author, index) => <li key={index}>{author}</li>)
                            ) : (
                                <li>No favorite authors</li>
                            )}
                        </ul>
                    </div>

                    <button className="submit-button" onClick={handleSubmit}>Save Profile</button>
                </div>
            </div>

            {/* Right Side */}
            <div className="profile-right">
                <div className="grid-container">
                    <div className="book-card">
                        <h3>Purchased Books</h3>
                        <ul>
                            {user.purchasedBooks?.length > 0 ? (
                                user.purchasedBooks.map((book, index) => <li key={index}>{book}</li>)
                            ) : (
                                <li>No purchased books</li>
                            )}
                        </ul>
                    </div>

                    <div className="book-card">
                        <h3>Rented Books</h3>
                        <ul>
                            {user.rentedBooks?.length > 0 ? (
                                user.rentedBooks.map((book, index) => <li key={index}>{book}</li>)
                            ) : (
                                <li>No rented books</li>
                            )}
                        </ul>
                    </div>

                    <div className="book-card">
                        <h3>Transaction History</h3>
                        <ul>
                            {user.transactions?.length > 0 ? (
                                user.transactions.map((transaction, index) => (
                                    <li key={index}>{transaction}</li>
                                ))
                            ) : (
                                <li>No transactions found</li>
                            )}
                        </ul>
                    </div>

                    <div className="book-card">
                        <h3>Preferred Language</h3>
                        <select value={user.preferredLanguage} onChange={handleLanguageChange}>
                            <option value="" disabled>Select a language</option>
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                            <option value="Chinese">Chinese</option>
                        </select>
                        <div className="selected-language">
                            <strong>Selected:</strong> {user.preferredLanguage || "None"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

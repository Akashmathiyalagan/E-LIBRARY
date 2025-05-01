import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import {
    FaSearch,
    FaBell,
    FaUser,
    FaHome,
    FaGlobe,
    FaStar,
    FaCircle
} from "react-icons/fa";
import logo from "./assets/logo.png";
import PreviewModal from "./PreviewModal";

const Dashboard = () => {
    const navigate = useNavigate();

    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [filteredAuthors, setFilteredAuthors] = useState([]);
    const [selectedAuthor, setSelectedAuthor] = useState(null);
    const [bookSearch, setBookSearch] = useState("");
    const [authorSearch, setAuthorSearch] = useState("");
    const [favoriteAuthors, setFavoriteAuthors] = useState(
        JSON.parse(localStorage.getItem("favoriteAuthors")) || []
    );
    const [newBookNotifications, setNewBookNotifications] = useState({});

    const [selectedBook, setSelectedBook] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);

    useEffect(() => {
        axios
            .get("http://localhost:5000/get_uploaded_books")
            .then((response) => {
                setBooks(response.data.books);
                setFilteredBooks(response.data.books);
                checkNewBooks(response.data.books);
            })
            .catch((error) => console.error("Error fetching books:", error));

        axios
            .get("http://localhost:5000/get_authors")
            .then((response) => {
                setAuthors(response.data.authors);
                setFilteredAuthors(response.data.authors);
            })
            .catch((error) => console.error("Error fetching authors:", error));
    }, []);

    const checkNewBooks = (bookList) => {
        let newNotifications = {};
        favoriteAuthors.forEach((author) => {
            const hasNewBook = bookList.some(
                (book) => book.author === author && book.is_new
            );
            if (hasNewBook) {
                newNotifications[author] = true;
            }
        });
        setNewBookNotifications(newNotifications);
    };

    const generatePreview = async (book) => {
        const authorDetails = authors.includes(book.author)
            ? `${book.author} is a reputed author in our library.`
            : `Details about ${book.author} are limited.`;
    
        let summary = "Generating AI summary...";
    
        try {
            const response = await fetch("http://localhost:5000/gemini-summary", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: book.title,
                    author: book.author,
                    description: book.description || "No description provided."
                }),
            });
    
            const result = await response.json();
            summary = result.summary || "No summary available.";
        } catch (error) {
            console.error("Error fetching summary:", error);
            summary = "Failed to generate summary.";
        }
    
        setPreviewData({
            title: book.title,
            author: book.author,
            authorDetails,
            description: book.description || "No description available.",
            price: formatPrice(book.price),
            summary,
            book,
        });
        setShowPreview(true);
    };
    

    const handleBookClick = (book) => {
        generatePreview(book);
    };

    const handleConfirmToPay = (book) => {
        setShowPreview(false);
        if (parseFloat(book.price) > 0) {
            navigate("/PaymentPage", { state: { book } });
        } else {
            navigate(`/OpenBookPage/${book._id}`, { state: { book } });
        }
    };
    
    const handleAuthorClick = (author) => {
        setSelectedAuthor(author);
        const filtered = books.filter((book) => book.author === author);
        setFilteredBooks(filtered);
        setNewBookNotifications((prev) => ({ ...prev, [author]: false }));
    };

    const handleBookSearch = (event) => {
        const searchValue = event.target.value.toLowerCase();
        setBookSearch(searchValue);

        if (!searchValue) {
            setFilteredBooks(
                books.filter(
                    (book) => !selectedAuthor || book.author === selectedAuthor
                )
            );
            return;
        }

        const filtered = books.filter(
            (book) =>
                book.title.toLowerCase().includes(searchValue) &&
                (!selectedAuthor || book.author === selectedAuthor)
        );
        setFilteredBooks(filtered);
    };

    const handleAuthorSearch = (event) => {
        const searchValue = event.target.value.toLowerCase();
        setAuthorSearch(searchValue);

        if (!searchValue) {
            setFilteredAuthors(authors);
            return;
        }

        const filtered = authors.filter((author) =>
            author.toLowerCase().includes(searchValue)
        );
        setFilteredAuthors(filtered);
    };

    const toggleFavoriteAuthor = (author) => {
        let updatedFavorites;
        if (favoriteAuthors.includes(author)) {
            updatedFavorites = favoriteAuthors.filter((fav) => fav !== author);
        } else {
            updatedFavorites = [...favoriteAuthors, author];
        }
        setFavoriteAuthors(updatedFavorites);
        localStorage.setItem("favoriteAuthors", JSON.stringify(updatedFavorites));
    };

    const formatPrice = (price) => {
        const parsed = parseFloat(price);
        if (!isNaN(parsed)) return `₹${parsed.toFixed(2)}`;
        return "₹0.00";
    };

    return (
        <div className="dashboard-container">
            <div className="navbar">
                <div className="logo-container" onClick={() => navigate("/")}>
                    <img src={logo} alt="Logo" className="logo-img" />
                    <span className="logo-text">E-LIBRARY</span>
                </div>
                <div className="search-container">
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search books..."
                        value={bookSearch}
                        onChange={handleBookSearch}
                    />
                    <FaSearch className="search-icon" />
                </div>
                <div className="nav-icons">
                    <FaGlobe className="icon" onClick={() => navigate("/Browse")} />
                    <FaHome className="icon" onClick={() => navigate("/")} />
                    <FaBell
                        className="icon"
                        onClick={() => navigate("/FavoriteAuthor")}
                    />
                    <FaUser className="icon" onClick={() => navigate("/Profile")} />
                </div>
            </div>

            <div className="left-sidebar">
                <div className="author-search-container">
                    <input
                        type="text"
                        className="author-search-bar"
                        placeholder="Search for authors"
                        value={authorSearch}
                        onChange={handleAuthorSearch}
                    />
                    <FaSearch className="author-search-icon" />
                </div>
                <div className="author-list">
                    <h4>Authors:</h4>
                    <ul>
                        {filteredAuthors.length > 0 ? (
                            filteredAuthors.map((author, index) => (
                                <li key={index}>
                                    <span onClick={() => handleAuthorClick(author)}>
                                        {author}
                                        {newBookNotifications[author] && (
                                            <FaCircle className="notification-dot" />
                                        )}
                                    </span>
                                    <FaStar
                                        className={`favorite-icon ${
                                            favoriteAuthors.includes(author)
                                                ? "favorited"
                                                : ""
                                        }`}
                                        onClick={() => toggleFavoriteAuthor(author)}
                                    />
                                </li>
                            ))
                        ) : (
                            <p>No authors found</p>
                        )}
                    </ul>
                </div>
            </div>

            <div className="dashboard-content">
                {selectedAuthor && (
                    <div className="author-details">
                        <h3>Books by {selectedAuthor}</h3>
                    </div>
                )}

                <div className="book-section">
                    <h3>{selectedAuthor ? `Books by ${selectedAuthor}` : "All Books"}</h3>
                    <div className="book-grid">
                        {filteredBooks.length > 0 ? (
                            filteredBooks.map((book, index) => (
                                <div
                                    key={index}
                                    className="book-card"
                                    onClick={() => handleBookClick(book)}
                                >
                                    <img
                                        src={book.cover_url}
                                        alt={book.title}
                                        className="book-cover"
                                    />
                                    <p className="book-title">
                                        {book.title} - {formatPrice(book.price)}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p>No books available</p>
                        )}
                    </div>
                </div>
            </div>

            {showPreview && (
                <PreviewModal
                    data={previewData}
                    onClose={() => setShowPreview(false)}
                    onConfirm={handleConfirmToPay}
                />
            )}
        </div>
    );
};

export default Dashboard;

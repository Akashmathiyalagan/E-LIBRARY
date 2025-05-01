import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCircle } from "react-icons/fa";
import "./FavoriteAuthor.css"; // CSS styles

const FavoriteAuthors = () => {
    const [favoriteAuthors, setFavoriteAuthors] = useState(() => JSON.parse(localStorage.getItem("favoriteAuthors")) || []);
    const [newBooksByAuthors, setNewBooksByAuthors] = useState({});
    const [selectedAuthor, setSelectedAuthor] = useState(null);
    const [booksByAuthor, setBooksByAuthor] = useState([]);

    useEffect(() => {
        if (favoriteAuthors.length === 0) return;

        const fetchNewBooks = async () => {
            try {
                const response = await axios.get("http://localhost:5000/get_uploaded_books");
                const allBooks = response.data.books || [];

                let newBooks = {};
                favoriteAuthors.forEach(author => {
                    const authorBooks = allBooks.filter(book => book.author === author && book.is_new);
                    if (authorBooks.length > 0) {
                        newBooks[author] = authorBooks;
                    }
                });

                setNewBooksByAuthors(newBooks);
            } catch (error) {
                console.error("Error fetching books:", error);
            }
        };

        fetchNewBooks();
    }, [favoriteAuthors]);

    const handleAuthorClick = (author) => {
        setSelectedAuthor(author);
        setBooksByAuthor(newBooksByAuthors[author] || []);
    };

    return (
        <div className="favorite-authors-container">
            <h2>New Books by Your Favorite Authors</h2>
            
            {Object.keys(newBooksByAuthors).length === 0 ? (
                <p>No new books from your favorite authors.</p>
            ) : (
                <ul className="author-list">
                    {Object.keys(newBooksByAuthors).map((author, index) => (
                        <li key={index} className="author-item" onClick={() => handleAuthorClick(author)}>
                            {author} <FaCircle className="notification-dot" />
                        </li>
                    ))}
                </ul>
            )}

            {/* Show Books by Selected Author */}
            {selectedAuthor && (
                <div className="books-section">
                    <h3>New Books by {selectedAuthor}</h3>
                    {booksByAuthor.length > 0 ? (
                        <ul className="book-list">
                            {booksByAuthor.map((book, index) => (
                                <li key={index} className="book-item">
                                    <img src={book.cover_url || "default_cover.jpg"} alt={book.title} className="book-cover" />
                                    <div className="book-details">
                                        <h4>{book.title}</h4>
                                        <button onClick={() => window.open(book.file_url, "_blank")} disabled={!book.file_url}>Read Now</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No new books available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default FavoriteAuthors;

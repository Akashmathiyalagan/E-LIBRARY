import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PublisherDashboard.css";

const PublisherDashboard = () => {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBooks = async () => {
            try {
              const token = localStorage.getItem("authorToken"); // Or whatever key you used to store it
              const response = await axios.get("http://localhost:5000/api/authors/my_books", {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              console.log("Books:", response.data);
              setBooks(response.data);
            } catch (error) {
              console.error("Error fetching books:", error);
            }
          };
          
    
        fetchBooks();
    }, []);
    
    const handleEdit = (id) => {
        navigate(`/edit-book/${id}`);
    };

    const handleDelete = async (bookId) => {
        const token = localStorage.getItem("authorToken");
        if (!bookId || !token) {
            console.error("❌ Missing book ID or token.");
            return;
        }

        try {
            const res = await axios.delete(`http://localhost:5000/api/books/${bookId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("✅ Deleted:", res.data);

            // Refresh book list after deletion
            setBooks((prevBooks) => prevBooks.filter((book) => book._id !== bookId));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    return (
        <div className="dashboard-container">
            <nav>
                <h1>E-Library</h1>
                <input
                    type="text"
                    placeholder="Search your books"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </nav>

            <h2 className="my-books-title">My Books</h2>

            <main>
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author Name</th>
                            <th>File</th>
                            <th>Price</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.length === 0 ? (
                            <tr>
                                <td colSpan="5">You haven’t uploaded any books yet.</td>
                            </tr>
                        ) : (
                            books
                                .filter((book) => book.title.toLowerCase().includes(search.toLowerCase()))
                                .map((book) => (
                                    <tr key={book._id}>
                                        <td>{book.title}</td>
                                        <td>{book.author}</td>
                                        <td>
                                            <a href={book.file_url} target="_blank" rel="noopener noreferrer">
                                                Download
                                            </a>
                                        </td>
                                        <td>${book.price || "Free"}</td>
                                        <td>
                                            <button onClick={() => handleEdit(book._id)}>Edit</button> |{" "}
                                            <button onClick={() => handleDelete(book._id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </table>
            </main>

            <div className="upload-book-container">
                <button className="upload-book-btn" onClick={() => navigate("/UploadBook")}>
                    Upload Book
                </button>
            </div>
        </div>
    );
};

export default PublisherDashboard;
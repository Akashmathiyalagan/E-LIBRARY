import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UploadBook.css";

const UploadBooks = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setprice] = useState("");
  const [file, setFile] = useState(null);
  const [cover, setCover] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleCoverChange = (e) => setCover(e.target.files[0]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
        setError("You must be logged in to upload a book.");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("author", author);
    formData.append("price", price);
    formData.append("file", file);
    formData.append("cover", cover);

    try {
        const response = await axios.post("http://127.0.0.1:5000/upload_book", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,  // Ensure token is sent
            },
        });

        console.log("Upload response:", response.data);
        alert(response.data.message);
        navigate("/dashboard");
    } catch (error) {
        console.error("Upload error:", error.response);
        if (error.response?.status === 401) {
            setError("Unauthorized: Please log in again.");
            localStorage.removeItem("token"); // Clear invalid token
            navigate("/AuthorLogin"); // Redirect to login page
        } else {
            setError(error.response?.data?.error || "Upload failed. Please try again.");
        }
    }
};
  return (
    <div className="upload-container">
      <div className="scroll-paper">
        <h2 className="scroll-title">Upload a New Book</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Title:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          
          <label>Description:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
          
          <label>Author:</label>
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required />
          
          <label>price:</label>
          <input type="number" value={price} onChange={(e) => setprice(e.target.value)} required />
          
          <label>Upload Book File:</label>
          <input type="file" onChange={handleFileChange} required />
          
          <label>Upload Cover Image:</label>
          <input type="file" onChange={handleCoverChange}  />
          
          <button type="submit">Upload Book</button>
        </form>
      </div>
    </div>
  );
};

export default UploadBooks;

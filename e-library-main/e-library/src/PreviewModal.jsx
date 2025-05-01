import React from "react";
import "./PreviewModal.css"; // Add any styling you need

const PreviewModal = ({ data, onClose, onConfirm }) => {
    if (!data) return null;

    const { title, author, authorDetails, description, price, summary, book } = data;

    // Optional chaining and fallback to prevent errors
    const cover = book?.cover_url || "https://via.placeholder.com/150";

    return (
        <div className="preview-modal-overlay">
        <div className="preview-modal-content">
            <span className="preview-close" onClick={onClose}>&times;</span>
            <h2>{data.title}</h2>
            <p><strong>Author:</strong> {data.author}</p>
            <p><strong>About the Author:</strong> {data.authorDetails}</p>
            <p><strong>Description:</strong> {data.description}</p>
            <p><strong>AI Summary:</strong> {data.summary}</p>
            <p><strong>Price:</strong> {data.price}</p>
            <div className="preview-buttons">
                <button onClick={onClose}>Cancel</button>
                <button onClick={() => onConfirm(data.book)}>Confirm to Pay</button>
            </div>
        </div>
    </div>
    
    );
};

export default PreviewModal;

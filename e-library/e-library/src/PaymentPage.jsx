import React, { useState, useEffect } from "react";
import axios from "axios";

const PaymentPage = ({ bookId }) => {
  const [book, setBook] = useState(null);
  const [purchaseType, setPurchaseType] = useState("permanent");
  const [rentalDays, setRentalDays] = useState(1);
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    const fetchBook = async () => {
      const res = await axios.get(`/api/book/${bookId}`);
      setBook(res.data);
    };
    fetchBook();
  }, [bookId]);

  useEffect(() => {
    if (book) {
      if (purchaseType === "permanent") {
        setFinalPrice(book.price);
      } else {
        const rentRate = book.price * 0.1; // e.g., 10% of price per day
        setFinalPrice((rentRate * rentalDays).toFixed(2));
      }
    }
  }, [purchaseType, rentalDays, book]);

  const handlePayment = async () => {
    const payload = {
      bookId,
      purchaseType,
      rentalDays: purchaseType === "rental" ? rentalDays : null,
      amount: finalPrice,
    };

    const res = await axios.post("/api/payment/create-checkout-session", payload);
    window.location.href = res.data.checkoutUrl;
  };

  if (!book) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-yellow-100 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Buy or Rent: {book.title}</h2>

      <div className="mb-4">
        <label className="block font-medium mb-2">Purchase Option</label>
        <select
          className="w-full border rounded p-2"
          value={purchaseType}
          onChange={(e) => setPurchaseType(e.target.value)}
        >
          <option value="permanent">Permanent Purchase</option>
          <option value="rental">Rent (by days)</option>
        </select>
      </div>

      {purchaseType === "rental" && (
        <div className="mb-4">
          <label className="block font-medium mb-2">Rental Duration (Days)</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            min={1}
            value={rentalDays}
            onChange={(e) => setRentalDays(e.target.value)}
          />
        </div>
      )}

      <div className="mb-4 text-xl">
        <strong>Total Price:</strong> ${finalPrice}
      </div>

      <button
        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        onClick={handlePayment}
      >
        Confirm & Pay
      </button>
    </div>
  );
};

export default PaymentPage;

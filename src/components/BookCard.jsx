import React from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import api from "../api/apiService";
import useAuth from "../hooks/useAuth";

export default function BookCard({ book, onOrdered }) {
  const { user, toggleFavorite } = useAuth();
  const isFavorited = user?.favorites?.includes(book.id);

  const handleOrder = async () => {
    try {
      // 1) Označi knjigu kao iznajmljenu
      await api.patch(`/books/${book.id}`, { rentedBy: user.id });
      // 2) Kreiraj zapis u orders nizu
      await api.post("/orders", {
        id: uuidv4(),
        userId: user.id,
        bookId: book.id,
        rentedAt: new Date().toISOString(),
        returnedAt: null
      });
      // 3) Callback da HomePage ponovo učita knjige
      onOrdered();
    } catch (err) {
      console.error("Greška pri poručivanju:", err);
    }
  };

  return (
    <div className="relative flex flex-col bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition h-full">
      {user?.role === "user" && (
        <button
          onClick={() => toggleFavorite(book.id)}
          className="absolute top-3 right-3 z-10 p-1 bg-white rounded-full shadow"
        >
          {isFavorited ? <Star className="w-6 h-6 text-yellow-400" /> 
                        : <Star className="w-6 h-6 text-gray-400" />}
        </button>
      )}

      <Link to={`/books/${book.id}`} className="group mb-4">
        <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden">
          <img
            src={book.image || "https://via.placeholder.com/300x400?text=No+Cover"}
            alt={book.title}
            className="w-full h-full object-cover transition group-hover:opacity-90"
          />
        </div>
        <h3 className="mt-3 text-lg font-bold group-hover:text-blue-600 transition">
          {book.title}
        </h3>
        <p className="text-gray-600">{book.author}</p>
      </Link>

      {user?.role === "user" && !book.rentedBy && (
        <button
          onClick={handleOrder}
          className="mt-auto bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition"
        >
          Poruči
        </button>
      )}
      {user && book.rentedBy === user.id && (
        <span className="mt-auto text-gray-500">Već ste iznajmili</span>
      )}
    </div>
  );
}

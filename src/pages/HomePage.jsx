import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";
import api from "../api/apiService";
import useAuth from "../hooks/useAuth";

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Pagination state
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const fetchBooks = async () => {
    try {
      const res = await api.get("/books");
      setBooks(res.data);
    } catch (err) {
      console.error("Greška pri učitavanju knjiga:", err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Prikaži samo knjige koje niko nije iznajmio
  const available = books.filter(book => book.rentedBy === null);

  const totalPages = Math.max(1, Math.ceil(available.length / ITEMS_PER_PAGE));
  const start = (page - 1) * ITEMS_PER_PAGE;
  const currentBooks = available.slice(start, start + ITEMS_PER_PAGE);

  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/register");
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <Navbar />
        <h1 className="text-3xl font-bold">Biblioteka</h1>
        <div>
          {!user ? (
            <div className="space-x-4">
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                Login
              </button>
              <button
                onClick={handleRegister}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
              >
                Registracija
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Dobrodošli, {user.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow">
        <h2 className="text-2xl font-semibold mb-4">Sve knjige</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onOrdered={() => fetchBooks()}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-3 mt-8">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            >
              Prethodna
            </button>
            <span className="px-3 py-1">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            >
              Sledeća
            </button>
          </div>
        )}
      </main>
    </div>
);
}

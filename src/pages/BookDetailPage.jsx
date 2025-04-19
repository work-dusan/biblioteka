import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import Navbar from "../components/Navbar";
import useAuth from "../hooks/useAuth";
import api from "../api/apiService";

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleFavorite } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/books/${id}`)
      .then(res => {
        setBook(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Greška pri dohvaćanju knjige:", err);
        setError("Knjiga nije pronađena.");
        setLoading(false);
      });
  }, [id]);

  const handleOrder = async () => {
    if (!user) return;
    try {
      await api.patch(`/books/${id}`, { rentedBy: user.id });
      await api.post("/orders", {
        userId: user.id,
        bookId: id,
        rentedAt: new Date().toISOString(),
        returnedAt: null
      });
      alert("Knjiga uspešno poručena!");
      navigate("/orders");
    } catch (err) {
      console.error("Greška pri poručivanju:", err);
      alert("Greška pri poručivanju, pokušajte ponovo.");
    }
  };

  const handleToggleFav = () => {
    if (user) toggleFavorite(book.id);
  };

  if (loading) return <div className="p-6">Učitavanje...</div>;
  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
        <button onClick={() => navigate("/")} className="mt-4 underline">
          Nazad
        </button>
      </div>
    );
  }

  const isFav = user?.favorites?.includes(book.id);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-8">
        <Navbar />
        <h1 className="text-3xl font-bold">{book.title}</h1>
      </header>

      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leva kolona: velika slika */}
        <div className="flex justify-center items-start">
          <img
            src={book.image}
            alt={book.title}
            className="w-full h-auto max-h-[600px] object-contain rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <div>
            <p className="text-gray-700 mb-2"><strong>Autor:</strong> {book.author}</p>
            <p className="text-gray-700 mb-2"><strong>Godina:</strong> {book.year}</p>
            {book.description && (
              <p className="text-gray-700 mb-4"><strong>Opis:</strong> {book.description}</p>
            )}
          </div>

          <div className="mt-auto flex items-center space-x-4">
            {user?.role === "user" && (
              <button
                onClick={handleToggleFav}
                className="p-2 bg-white rounded-full shadow hover:shadow-md transition z-10"
              >
                <Star
                  className={`w-6 h-6 ${
                    isFav ? "text-yellow-500 fill-current" : "text-gray-400 stroke-current"
                  }`}
                />
              </button>
            )}
            {user?.role === "user" && (
              <button
                onClick={handleOrder}
                className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
              >
                Poruči ovu knjigu
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition"
            >
              Nazad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
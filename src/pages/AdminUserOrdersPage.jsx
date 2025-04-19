import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/apiService";

export default function AdminUserOrdersPage() {
  const { id: userId } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // dohvatimo sve porudžbine tog korisnika
    api.get(`/orders?userId=${userId}`)
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
    // dohvatimo sve knjige da bismo mogli da mapiramo bookId -> naslov
    api.get("/books")
      .then(res => setBooks(res.data))
      .catch(err => console.error(err));
  }, [userId]);

  // trenutno ne vraćene porudžbine
  const current = orders.filter(o => !o.returnedAt);
  // istorija vraćenih porudžbina
  const history = orders.filter(o => o.returnedAt);

  const renderOrder = o => {
    const book = books.find(b => b.id === o.bookId);
    return (
      <div key={o.id} className="bg-white p-4 rounded-2xl shadow flex items-center space-x-4">
        <img
          src={book?.image || "https://via.placeholder.com/80x120?text=No+Cover"}
          alt={book?.title}
          className="w-20 h-28 object-cover rounded"
        />
        <div>
          <h4 className="font-bold">{book?.title || "Nepoznata knjiga"}</h4>
          <p className="text-gray-600">{book?.author}</p>
          <p className="text-sm text-gray-500">
            Iznajmljena: {new Date(o.rentedAt).toLocaleDateString()}
          </p>
          {o.returnedAt && (
            <p className="text-sm text-gray-500">
              Vraćena: {new Date(o.returnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Navbar />
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline"
          >
            ← Nazad
          </button>
        </div>
      </header>

      <main className="flex-grow p-6 max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold">Korisnik: {userId}</h2>

        <section>
          <h3 className="text-xl font-semibold mb-4">Trenutno iznajmljene</h3>
          {current.length
            ? <div className="space-y-4">{current.map(renderOrder)}</div>
            : <p className="text-gray-600">Nema aktivnih iznajmljivanja.</p>
          }
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">Istorija porudžbina</h3>
          {history.length
            ? <div className="space-y-4">{history.map(renderOrder)}</div>
            : <p className="text-gray-600">Još nema vraćenih porudžbina.</p>
          }
        </section>
      </main>
    </div>
  );
}

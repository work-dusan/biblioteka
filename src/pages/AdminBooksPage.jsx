import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/apiService";

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    id: "",
    title: "",
    author: "",
    year: "",
    image: "",
    description: ""
  });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      const res = await api.get("/books");
      setBooks(res.data);
    } catch (err) {
      console.error("Greška pri učitavanju knjiga:", err);
    }
  }

  function resetForm() {
    setForm({ id: "", title: "", author: "", year: "", image: "", description: "" });
    setErrors({});
    setMsg("");
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) {
      errs.title = "Naslov je obavezan.";
    }
    if (!form.author.trim()) {
      errs.author = "Autor je obavezan.";
    }
    if (!form.year.trim()) {
      errs.year = "Godina izdanja je obavezna.";
    } else if (!/^\d{1,4}$/.test(form.year.trim())) {
      errs.year = "Godina mora biti broj.";
    }
    // image i description mogu da ostanu prazni
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    const valErrors = validate();
    if (Object.keys(valErrors).length) {
      setErrors(valErrors);
      return;
    }
    setErrors({});
    try {
      if (form.id) {
        // Update existing book
        await api.patch(`/books/${form.id}`, {
          title: form.title.trim(),
          author: form.author.trim(),
          year: form.year.trim(),
          image: form.image.trim() || null,
          description: form.description.trim() || null
        });
        setMsg("Knjiga uspešno ažurirana.");
      } else {
        // New ID = max + 1
        const maxId = books.reduce((max, b) => {
          const n = Number(b.id);
          return isNaN(n) ? max : Math.max(max, n);
        }, 0);
        const newId = String(maxId + 1);
        await api.post("/books", {
          id: newId,
          title: form.title.trim(),
          author: form.author.trim(),
          year: form.year.trim(),
          image: form.image.trim() || null,
          description: form.description.trim() || null,
          rentedBy: null
        });
        setMsg("Knjiga uspešno dodata.");
      }
      resetForm();
      fetchBooks();
    } catch (err) {
      console.error("Greška pri čuvanju knjige:", err);
      setMsg("Greška pri čuvanju knjige.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Obriši ovu knjigu?")) return;
    setMsg("");
    try {
      // 1) Obrišemo sve porudžbine za tu knjigu
      const ordersRes = await api.get(`/orders?bookId=${id}`);
      await Promise.all(
        ordersRes.data.map(o => api.delete(`/orders/${o.id}`))
      );
      // 2) Izbrišemo referencu u favorites svih korisnika
      const usersRes = await api.get("/users");
      await Promise.all(
        usersRes.data
          .filter(u => Array.isArray(u.favorites) && u.favorites.includes(id))
          .map(u => {
            const newFavs = u.favorites.filter(favId => favId !== id);
            return api.patch(`/users/${u.id}`, { favorites: newFavs });
          })
      );
      // 3) Obrišemo knjigu
      await api.delete(`/books/${id}`);

      setMsg("Knjiga obrisana, porudžbine i favorite uklonjeni.");
      fetchBooks();
    } catch (err) {
      console.error("Greška pri brisanju knjige:", err);
      setMsg("Greška pri brisanju knjige.");
    }
  }

  const edit = b => {
    setForm({
      id: b.id,
      title: b.title,
      author: b.author,
      year: b.year,
      image: b.image || "",
      description: b.description || ""
    });
    setErrors({});
    setMsg("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Navbar />
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow p-6">
        <h2 className="text-2xl font-bold mb-4">Upravljanje knjigama</h2>
        {msg && <p className="mb-4 text-green-600">{msg}</p>}

        {/* Add/Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow mb-8 max-w-lg">
          <h3 className="text-lg font-semibold mb-4">
            {form.id ? "Izmeni knjigu" : "Dodaj knjigu"}
          </h3>

          {/* Title */}
          <div className="mb-4">
            <label className="block mb-1">Naslov</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className={`w-full border px-3 py-2 rounded ${errors.title ? "border-red-500" : ""}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Author */}
          <div className="mb-4">
            <label className="block mb-1">Autor</label>
            <input
              type="text"
              value={form.author}
              onChange={e => setForm({ ...form, author: e.target.value })}
              className={`w-full border px-3 py-2 rounded ${errors.author ? "border-red-500" : ""}`}
            />
            {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
          </div>

          {/* Year */}
          <div className="mb-4">
            <label className="block mb-1">Godina izdanja</label>
            <input
              type="text"
              value={form.year}
              onChange={e => setForm({ ...form, year: e.target.value })}
              className={`w-full border px-3 py-2 rounded ${errors.year ? "border-red-500" : ""}`}
            />
            {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
          </div>

          {/* Image (optional) */}
          <div className="mb-4">
            <label className="block mb-1">Slika (URL)</label>
            <input
              type="text"
              value={form.image}
              onChange={e => setForm({ ...form, image: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Description (optional) */}
          <div className="mb-4">
            <label className="block mb-1">Opis</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="flex space-x-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
              {form.id ? "Sačuvaj" : "Dodaj"}
            </button>
            {form.id && (
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded bg-gray-300">
                Otkaži
              </button>
            )}
          </div>
        </form>

        {/* Books List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map(b => (
            <div key={b.id} className="bg-white p-4 rounded-2xl shadow flex flex-col">
              <h4 className="font-bold">{b.title}</h4>
              <p className="text-gray-600">{b.author} ({b.year})</p>
              <div className="mt-auto flex space-x-2 pt-4">
                <button onClick={() => edit(b)} className="px-3 py-1 bg-yellow-500 text-white rounded">
                  Izmeni
                </button>
                <button onClick={() => handleDelete(b.id)} className="px-3 py-1 bg-red-500 text-white rounded">
                  Obriši
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

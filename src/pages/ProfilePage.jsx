import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import Navbar from "../components/Navbar";
import useAuth from "../hooks/useAuth";
import api from "../api/apiService";

export default function ProfilePage() {
  const { user, logout, toggleFavorite } = useAuth();
  const navigate = useNavigate();

  // States for personal info
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({});

  // All books for favorites
  const [books, setBooks] = useState([]);

  useEffect(() => {
    api.get("/books")
       .then(res => setBooks(res.data))
       .catch(err => console.error("Greška pri učitavanju knjiga:", err));
  }, []);

  if (!user) {
    return <div className="p-6">Niste ulogovani.</div>;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Validate personal info
  const validateProfile = () => {
    const errs = {};
    if (name.trim().length < 2) {
      errs.name = "Ime mora imati bar 2 znaka.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errs.email = "Nevažeća email adresa.";
    }
    return errs;
  };

  const handleUpdate = async e => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      // Check for duplicate email
      const res = await api.get(`/users?email=${encodeURIComponent(email.trim())}`);
      const conflict = res.data.find(u => u.id !== user.id);
      if (conflict) {
        setErrors({ email: "Ovaj email je već u upotrebi." });
        return;
      }

      await api.patch(`/users/${user.id}`, {
        name: name.trim(),
        email: email.trim()
      });
      alert("Profil uspešno ažuriran!");
    } catch (err) {
      console.error("Greška pri ažuriranju profila:", err);
      setErrors({ submit: "Došlo je do greške pri ažuriranju." });
    }
  };

  const handlePasswordChange = async e => {
    e.preventDefault();
    const errs = {};
    if (oldPassword !== user.password) {
      errs.oldPassword = "Stara lozinka nije tačna.";
    }
    if (newPassword.length < 6) {
      errs.newPassword = "Nova lozinka mora imati najmanje 6 karaktera.";
    }
    if (newPassword !== confirmPassword) {
      errs.confirmPassword = "Lozinke se ne poklapaju.";
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      await api.patch(`/users/${user.id}`, { password: newPassword });
      alert("Lozinka uspešno promenjena! Prijavite se ponovo.");
      logout();
      navigate("/login");
    } catch (err) {
      console.error("Greška pri promeni lozinke:", err);
      setErrors({ submitPW: "Došlo je do greške pri promeni lozinke." });
    }
  };

  // Favorites list
  const favoriteBooks = books.filter(b => user.favorites?.includes(b.id));

  const handleToggleFav = bookId => {
    toggleFavorite(bookId);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <Navbar />
        <h1 className="text-3xl font-bold">Moj Profil</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
        >
          Logout
        </button>
      </header>

      {/* Personal Info Form */}
      <section className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">Lični podaci</h2>
          {errors.submit && <p className="text-red-500 mb-2">{errors.submit}</p>}

          <div className="mb-4">
            <label className="block mb-1">Ime i prezime</label>
            <input
              type="text"
              className={`w-full border px-3 py-2 rounded ${errors.name ? "border-red-500" : ""}`}
              value={name}
              onChange={e => setName(e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              className={`w-full border px-3 py-2 rounded ${errors.email ? "border-red-500" : ""}`}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
          >
            Ažuriraj podatke
          </button>
        </form>

        {/* Password Change Form */}
        <form onSubmit={handlePasswordChange} className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-2xl font-semibold mb-4">Promena lozinke</h2>
          {errors.submitPW && <p className="text-red-500 mb-2">{errors.submitPW}</p>}

          <div className="mb-4">
            <label className="block mb-1">Stara lozinka</label>
            <input
              type="password"
              className={`w-full border px-3 py-2 rounded ${errors.oldPassword ? "border-red-500" : ""}`}
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
            />
            {errors.oldPassword && <p className="text-red-500 text-sm mt-1">{errors.oldPassword}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-1">Nova lozinka</label>
            <input
              type="password"
              className={`w-full border px-3 py-2 rounded ${errors.newPassword ? "border-red-500" : ""}`}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-1">Potvrdi novu lozinku</label>
            <input
              type="password"
              className={`w-full border px-3 py-2 rounded ${errors.confirmPassword ? "border-red-500" : ""}`}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Promeni lozinku
          </button>
        </form>
      </section>

      {/* Orders Button */}
      <section className="max-w-2xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold mb-4">Porudžbine</h2>
        <button
          onClick={() => navigate("/orders")}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          Pogledaj moje porudžbine
        </button>
      </section>

      {/* Favorites */}
      <section className="max-w-4xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold mb-4">Favoriti</h2>
        {favoriteBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteBooks.map(book => (
              <div key={book.id} className="relative bg-white p-4 rounded-2xl shadow hover:shadow-lg transition">
                {book.image && (
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-48 object-cover rounded-md mb-2"
                  />
                )}
                <h3 className="text-lg font-bold">{book.title}</h3>
                <p className="text-gray-600">{book.author}</p>
                <button
                  onClick={() => handleToggleFav(book.id)}
                  className="absolute top-3 right-3 p-1 bg-white rounded-full shadow"
                >
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-700">Nemate omiljene knjige.</p>
        )}
      </section>
    </div>
  );
}

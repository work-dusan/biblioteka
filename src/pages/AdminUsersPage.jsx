import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Navbar from "../components/Navbar";
import useAuth from "../hooks/useAuth";
import api from "../api/apiService";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Greška pri učitavanju korisnika:", err);
    }
  }

  function resetForm() {
    setForm({ id: "", name: "", email: "", password: "", role: "user" });
    setErrors({});
    setMsg("");
  }

  function validate() {
    const errs = {};
    if (form.name.trim().length < 2) {
      errs.name = "Ime mora imati bar 2 znaka.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      errs.email = "Nevažeća email adresa.";
    }
    if (!form.id && form.password.length < 6) {
      errs.password = "Lozinka mora imati najmanje 6 karaktera.";
    }
    if (form.id && form.password && form.password.length < 6) {
      errs.password = "Nova lozinka mora imati najmanje 6 karaktera.";
    }
    return errs;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // Provera duplikata emaila
    try {
      const res = await api.get(`/users?email=${encodeURIComponent(form.email.trim())}`);
      const conflict = res.data.find(u => u.id !== form.id);
      if (conflict) {
        setErrors({ email: "Ovaj email je već u upotrebi." });
        return;
      }
    } catch {
      // ignore
    }

    setErrors({});
    try {
      if (form.id) {
        // PATCH samo promenjene atribute
        const data = {
          name: form.name.trim(),
          email: form.email.trim(),
          ...(form.id !== currentUser.id && { role: form.role }),
          ...(form.password && { password: form.password }),
        };
        await api.patch(`/users/${form.id}`, data);
        setMsg("Korisnik uspešno ažuriran.");
      } else {
        // Kreiraj novog korisnika sa uuid
        const newUser = {
          id: uuidv4(),
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          favorites: []
        };
        await api.post("/users", newUser);
        setMsg("Korisnik uspešno dodat.");
      }
      resetForm();
      fetchUsers();
    } catch {
      setMsg("Greška pri čuvanju korisnika.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Obriši ovog korisnika?")) return;

    try {
      // 1) Dohvati sve porudžbine korisnika
      const { data: allOrders } = await api.get(`/orders?userId=${id}`);

      // 2) Za sve porudžbine koje nisu vraćene, obeleži ih kao vraćene
      const now = new Date().toISOString();
      await Promise.all(
        allOrders
          .filter(o => o.returnedAt === null)
          .map(o => api.patch(`/orders/${o.id}`, { returnedAt: now }))
      );

      // 3) Oslobodi sve knjige koje je korisnik iznajmio
      const { data: rentedBooks } = await api.get(`/books?rentedBy=${id}`);
      await Promise.all(
        rentedBooks.map(b => api.patch(`/books/${b.id}`, { rentedBy: null }))
      );

      // 4) Obriši sve porudžbine (sada su sve vraćene)
      await Promise.all(
        allOrders.map(o => api.delete(`/orders/${o.id}`))
      );

      // 5) Obriši korisnika
      await api.delete(`/users/${id}`);

      setMsg("Korisnik obrisan, porudžbine vraćene i izbrisane.");
      fetchUsers();
    } catch (err) {
      console.error(err);
      setMsg("Greška pri brisanju korisnika.");
    }
  };

  const edit = (u) => {
    setForm({ ...u, password: "" });
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
        <h2 className="text-2xl font-bold mb-4">Upravljanje korisnicima</h2>
        {msg && <p className="mb-4 text-green-600">{msg}</p>}

        {/* Forma za dodavanje/izmenu */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow mb-8 max-w-lg">
          <h3 className="text-lg font-semibold mb-4">
            {form.id ? "Izmeni korisnika" : "Dodaj korisnika"}
          </h3>

          {/* Ime */}
          <div className="mb-4">
            <label className="block mb-1">Ime</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className={`w-full border px-3 py-2 rounded ${errors.name ? "border-red-500" : ""}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className={`w-full border px-3 py-2 rounded ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Lozinka */}
          <div className="mb-4">
            <label className="block mb-1">Lozinka</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className={`w-full border px-3 py-2 rounded ${errors.password ? "border-red-500" : ""}`}
              required={!form.id}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Uloga */}
          <div className="mb-4">
            <label className="block mb-1">Uloga</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              disabled={form.id === currentUser.id}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {form.id === currentUser.id && (
              <p className="text-sm text-gray-500 mt-1">Ne možete promeniti sopstvenu ulogu.</p>
            )}
          </div>

          <div className="flex space-x-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              {form.id ? "Sačuvaj" : "Dodaj"}
            </button>
            {form.id && (
              <button type="button" onClick={resetForm} className="px-3 py-2 rounded bg-gray-300">
                Otkaži
              </button>
            )}
          </div>
        </form>

        {/* Lista korisnika */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(u => (
            <div key={u.id} className="bg-white p-4 rounded-2xl shadow flex flex-col">
              <h4 className="font-bold">{u.name}</h4>
              <p className="text-gray-600">{u.email}</p>
              <p className="text-sm text-gray-500 mb-2">Role: {u.role}</p>
              <div className="mt-auto flex flex-wrap space-x-2 pt-4">
                <button onClick={() => edit(u)} className="px-3 py-1 bg-yellow-500 text-white rounded">
                  Izmeni
                </button>
                {u.id !== currentUser.id && (
                  <>
                    <button
                      onClick={() => navigate(`/admin/users/${u.id}/orders`)}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      Porudžbine
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Obriši
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

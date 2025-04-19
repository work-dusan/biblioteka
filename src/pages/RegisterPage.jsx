import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../api/apiService"; 

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (name.trim().length < 2) errs.name = "Ime mora imati bar 2 znaka.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) errs.email = "Nevažeća email adresa.";
    if (password.length < 6) errs.password = "Lozinka mora imati najmanje 6 karaktera.";
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    // Duplikat email provera...
    const existing = await api.get(`/users?email=${encodeURIComponent(email.trim())}`);
    if (existing.data.length) {
      setErrors({ email: "Ovaj email je već registrovan." });
      return;
    }

    await register(name.trim(), email.trim(), password);
    navigate("/profile");
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">Registracija</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Ime i prezime</label>
          <input
            type="text"
            className={`w-full border px-3 py-2 rounded ${errors.name ? "border-red-500" : ""}`}
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            className={`w-full border px-3 py-2 rounded ${errors.email ? "border-red-500" : ""}`}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block mb-1">Lozinka</label>
          <input
            type="password"
            className={`w-full border px-3 py-2 rounded ${errors.password ? "border-red-500" : ""}`}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition"
        >
          Registruj se
        </button>
      </form>

      <p className="mt-4 text-sm">
        Već imaš nalog?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Prijavi se
        </Link>
      </p>

      {/* Back to home */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/")}
          className="text-gray-600 hover:text-gray-900 underline"
        >
          ← Nazad na početnu
        </button>
      </div>
    </div>
  );
}

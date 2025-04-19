import React from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function AdminCard({ title, description, to, bgColor }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(to)}
      className={`
        cursor-pointer flex-1 bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition
        border-l-4 ${bgColor}
      `}
    >
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function AdminDashboard() {
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
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <AdminCard
            title="Upravljanje korisnicima"
            description="Dodaj, izmeni ili obriši korisnike"
            to="/admin/users"
            bgColor="border-blue-500"
          />
          <AdminCard
            title="Upravljanje knjigama"
            description="Dodaj, izmeni ili obriši knjige"
            to="/admin/books"
            bgColor="border-green-500"
          />
        </div>
      </main>
    </div>
  );
}

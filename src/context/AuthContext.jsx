import { createContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import api from "../api/apiService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = async (email, password) => {
    const res = await api.get(`/users?email=${email}&password=${password}`);
    if (res.data.length) {
      setUser(res.data[0]);
      return { success: true };
    }
    return { success: false, message: "Neispravni kredencijali" };
  };

  const register = async (name, email, password) => {
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password,
      role: "user",
      favorites: []
    };
    const res = await api.post("/users", newUser);
    setUser(res.data);
    return res.data;
  };

  const logout = () => setUser(null);

  // Metod za dodavanje/uklanjanje favorita
  const toggleFavorite = async (bookId) => {
    if (!user) return;
    const current = user.favorites || [];
    const updated = current.includes(bookId)
      ? current.filter(id => id !== bookId)
      : [...current, bookId];
    const res = await api.patch(`/users/${user.id}`, { favorites: updated });
    setUser(res.data);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, toggleFavorite }}
    >
      {children}
    </AuthContext.Provider>
  );
}

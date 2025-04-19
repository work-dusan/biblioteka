import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
    const { user, logout } = useAuth();

    const linkClass = ({ isActive }) =>
        isActive
            ? "text-blue-600 font-bold"
            : "text-gray-700 hover:text-gray-900";

    return (
        <nav className="flex space-x-6">
            <NavLink to="/" className={linkClass}>
                Početna
            </NavLink>

            {user?.role === "user" && (
                <>
                    <NavLink to="/profile" className={linkClass}>
                        Profil
                    </NavLink>
                    <NavLink to="/orders" className={linkClass}>
                        Moje porudžbine
                    </NavLink>
                </>
            )}

            {user?.role === "admin" && (
                <NavLink to="/admin" className={linkClass}>
                    Admin
                </NavLink>
            )}
        </nav>
    );
}
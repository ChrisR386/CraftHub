// src/layout/DashboardLayout.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, ClipboardList, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * DashboardLayout
 * - Einheitliches Layout mit Sidebar & mobilem Menü
 * - Für Seiten wie Taskboard, Settings, Team etc.
 */
export default function DashboardLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: "/tasks", label: "Aufgaben", icon: <ClipboardList className="w-4 h-4" /> },
    { to: "/profile", label: "Profil", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 z-40 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 
        ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">CraftHub</h1>
          <button
            onClick={() => setMenuOpen(false)}
            className="md:hidden text-gray-600 dark:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.to
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-500 dark:text-gray-400">
          {user ? (
            <p className="truncate px-4">Eingeloggt als <strong>{user.email}</strong></p>
          ) : (
            <p>Kein Benutzer angemeldet</p>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-4 py-3 md:hidden">
          <button
            onClick={() => setMenuOpen(true)}
            className="text-gray-700 dark:text-gray-200"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Dashboard</h2>
        </header>

        {/* Inhalt */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

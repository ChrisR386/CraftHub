import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import {
  Menu,
  Server,
  Monitor,
  Settings as SettingsIcon,
  Info,
  Sun,
  Moon,
} from "lucide-react";

// Seiten-Komponenten
function Dashboard() {
  return <h2 className="text-2xl font-semibold">Dashboard</h2>;
}

function Projekte() {
  return <h2 className="text-2xl font-semibold">Projekte</h2>;
}

function ApiTest() {
  return <h2 className="text-2xl font-semibold">API-Testbereich</h2>;
}

function Einstellungen() {
  return <h2 className="text-2xl font-semibold">Einstellungen</h2>;
}

function UeberCrafthub() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Über CraftHub</h2>
      <p className="text-gray-700 leading-relaxed">
        CraftHub ist eine modulare Plattform zur Verwaltung und Präsentation
        deiner Projekte. Hier kannst du Schnittstellen testen, Projekte
        organisieren und dein eigenes Entwickler-Dashboard aufbauen.
      </p>
    </div>
  );
}

// Sidebar-Link Komponente
function SidebarLink({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition"
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
}

// Hauptkomponente
export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      className={`flex min-h-screen ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <aside
        className={`w-64 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg p-5 flex flex-col justify-between`}
      >
        <div>
          <h1 className="text-2xl font-bold mb-6">CraftHub</h1>
          <nav className="space-y-2">
            <SidebarLink to="/" icon={Monitor} label="Dashboard" />
            <SidebarLink to="/projects" icon={Server} label="Projekte" />
            <SidebarLink to="/api-test" icon={Menu} label="API-Test" />
            <SidebarLink to="/settings" icon={SettingsIcon} label="Einstellungen" />
            <SidebarLink to="/about" icon={Info} label="Über CraftHub" />
          </nav>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          {darkMode ? (
            <>
              <Sun className="w-4 h-4" /> Helles Design aktivieren
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" /> Dunkles Design aktivieren
            </>
          )}
        </button>
      </aside>

      {/* Hauptbereich */}
      <main className="flex-1 p-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projekte />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/settings" element={<Einstellungen />} />
          <Route path="/about" element={<UeberCrafthub />} />
        </Routes>
      </main>
    </div>
  );
}

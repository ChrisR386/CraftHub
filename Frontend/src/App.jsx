import { useState } from "react";
import ApiTest from "./pages/ApiTest";

import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import {
  Menu,
  Server,
  Monitor,
  Settings as SettingsIcon,
  Info,
  Sun,
  Moon,
  FolderOpen,
  Search,
  CheckCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";

// Dummy-Projektdaten
const projekte = [
  {
    id: 1,
    name: "CraftHub Frontend",
    beschreibung: "React + Vite + Tailwind Grundgerüst",
    status: "In Arbeit",
    datum: "12.10.2025",
    details:
      "Dieses Projekt enthält die gesamte Frontend-Struktur von CraftHub inklusive Routing, Darkmode und Komponentenaufbau.",
  },
  {
    id: 2,
    name: "API-Anbindung",
    beschreibung: "Backend-Schnittstelle zur Projektverwaltung",
    status: "Geplant",
    datum: "20.10.2025",
    details:
      "Hier wird die Verbindung zum Backend implementiert, inklusive Authentifizierung, Datenabfrage und Speicherung.",
  },
  {
    id: 3,
    name: "Designsystem",
    beschreibung: "Komponenten-Bibliothek für UI-Elemente",
    status: "Abgeschlossen",
    datum: "05.10.2025",
    details:
      "Das Designsystem stellt konsistente UI-Komponenten bereit, die in allen Projekten genutzt werden können.",
  },
];

// -------------------- Seiten-Komponenten --------------------



// --- Projektübersicht ---
function Projekte() {
  const [search, setSearch] = useState("");
  const gefilterteProjekte = projekte.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Projekte</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Suche Projekte..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring focus:ring-blue-200 outline-none"
          />
        </div>
      </div>

      {gefilterteProjekte.length === 0 ? (
        <p className="text-gray-500">Keine Projekte gefunden.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gefilterteProjekte.map((projekt) => (
            <Link
              key={projekt.id}
              to={`/projects/${projekt.id}`}
              className="block p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition"
            >
              <div className="flex items-center justify-between mb-3">
                <FolderOpen className="w-6 h-6 text-blue-500" />
                {projekt.status === "Abgeschlossen" ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : projekt.status === "In Arbeit" ? (
                  <Clock className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <h3 className="font-semibold text-lg mb-1">{projekt.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {projekt.beschreibung}
              </p>
              <p className="text-xs text-gray-400">Letzte Änderung: {projekt.datum}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Projekt-Detailseite ---
function ProjektDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const projekt = projekte.find((p) => p.id === parseInt(id));

  if (!projekt) {
    return <p>Projekt nicht gefunden.</p>;
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-sm text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>

      <h2 className="text-3xl font-semibold mb-2">{projekt.name}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {projekt.beschreibung}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-sm text-gray-400 mb-1">Status</p>
          <p
            className={`font-semibold ${
              projekt.status === "Abgeschlossen"
                ? "text-green-500"
                : projekt.status === "In Arbeit"
                ? "text-yellow-500"
                : "text-gray-400"
            }`}
          >
            {projekt.status}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-sm text-gray-400 mb-1">Letzte Änderung</p>
          <p className="font-semibold">{projekt.datum}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-sm text-gray-400 mb-1">Projekt-ID</p>
          <p className="font-semibold">{projekt.id}</p>
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-md leading-relaxed">
        <h3 className="text-lg font-semibold mb-2">Beschreibung</h3>
        <p className="text-gray-700 dark:text-gray-300">{projekt.details}</p>
      </div>
    </div>
  );
}

// --- Weitere Seiten ---


function Einstellungen() {
  return <h2 className="text-2xl font-semibold">Einstellungen</h2>;
}

function UeberCrafthub() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Über CraftHub</h2>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        CraftHub ist eine modulare Plattform zur Verwaltung und Präsentation
        deiner Projekte. Hier kannst du Schnittstellen testen, Projekte
        organisieren und dein eigenes Entwickler-Dashboard aufbauen.
      </p>
    </div>
  );
}

// -------------------- Sidebar-Link-Komponente --------------------
function SidebarLink({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
}

// -------------------- Hauptkomponente --------------------
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
          className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
      <main className="flex-1 p-10 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projekte />} />
          <Route path="/projects/:id" element={<ProjektDetails />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/settings" element={<Einstellungen />} />
          <Route path="/about" element={<UeberCrafthub />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

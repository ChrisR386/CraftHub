import { Link } from "react-router-dom";
import { FolderOpen, CheckCircle, Clock, Menu } from "lucide-react";

const projekte = [
  { id: 1, name: "CraftHub Frontend", beschreibung: "React + Vite + Tailwind Grundgerüst", status: "In Arbeit", datum: "12.10.2025" },
  { id: 2, name: "API-Anbindung", beschreibung: "Backend-Schnittstelle", status: "Geplant", datum: "20.10.2025" },
  { id: 3, name: "Designsystem", beschreibung: "UI Komponenten-Bibliothek", status: "Abgeschlossen", datum: "05.10.2025" },
  { id: 4, name: "3D Farbenwelt", beschreibung: "Homepage & Shop", status: "Online", datum: "13.10.2025" },
];

export default function Projekte() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Projekte</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projekte.map((projekt) => (
          <Link key={projekt.id} to={`/projects/${projekt.id}`} className="block p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-3">
              <FolderOpen className="w-6 h-6 text-blue-500" />
              {projekt.status === "Abgeschlossen" ? <CheckCircle className="w-5 h-5 text-green-500" /> : projekt.status === "In Arbeit" ? <Clock className="w-5 h-5 text-yellow-500" /> : <Menu className="w-5 h-5 text-gray-400" />}
            </div>
            <h3 className="font-semibold text-lg mb-1">{projekt.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{projekt.beschreibung}</p>
            <p className="text-xs text-gray-400">Letzte Änderung: {projekt.datum}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { useParams } from "react-router-dom";

const projekte = [
  { id: 1, name: "CraftHub Frontend", beschreibung: "React + Vite + Tailwind Grundgerüst", status: "In Arbeit", datum: "12.10.2025", details: "Frontend-Basis..." },
  { id: 2, name: "API-Anbindung", beschreibung: "Backend-Schnittstelle", status: "Geplant", datum: "20.10.2025", details: "API-Integration..." },
  { id: 3, name: "Designsystem", beschreibung: "UI Komponenten", status: "Abgeschlossen", datum: "05.10.2025", details: "Komponenten..." },
  { id: 4, name: "3D Farbenwelt", beschreibung: "Homepage & Shop", status: "Online", datum: "13.10.2025", details: "Website: https://www.3dfarbenwelt.com" },
];

export default function ProjektDetails() {
  const { id } = useParams();
  const projekt = projekte.find((p) => p.id === Number(id));
  if (!projekt) return <p>Projekt nicht gefunden.</p>;
  return (
    <div>
      <h2 className="text-3xl font-semibold mb-2">{projekt.name}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{projekt.beschreibung}</p>
      <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p className="mb-2">{projekt.details}</p>
        {projekt.name.includes("3D Farbenwelt") && (
          <a href="https://www.3dfarbenwelt.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Zur Website &raquo;</a>
        )}
      </div>
    </div>
  );
}

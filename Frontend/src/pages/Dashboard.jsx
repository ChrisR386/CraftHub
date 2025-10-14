import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen,
  CheckCircle,
  Clock,
  List,
  Activity,
  PieChart as PieChartIcon,
  Wifi,
  Cpu,
  Zap,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Dummy-Daten (kannst du später durch Backend-Daten ersetzen)
const projekte = [
  { id: 1, name: "CraftHub Frontend", status: "In Arbeit", datum: "12.10.2025" },
  { id: 2, name: "API-Anbindung", status: "Geplant", datum: "20.10.2025" },
  { id: 3, name: "Designsystem", status: "Abgeschlossen", datum: "05.10.2025" },
  { id: 4, name: "Performance Optimierung", status: "In Arbeit", datum: "09.10.2025" },
  { id: 5, name: "Marketing Dashboard", status: "Geplant", datum: "13.10.2025" },
];

// Aktivitätsverlauf (letzte 14 Tage)
const aktivitaetDaten = [
  { tag: "01.10", anzahl: 2 },
  { tag: "02.10", anzahl: 3 },
  { tag: "03.10", anzahl: 1 },
  { tag: "04.10", anzahl: 4 },
  { tag: "05.10", anzahl: 2 },
  { tag: "06.10", anzahl: 5 },
  { tag: "07.10", anzahl: 3 },
  { tag: "08.10", anzahl: 4 },
  { tag: "09.10", anzahl: 6 },
  { tag: "10.10", anzahl: 4 },
  { tag: "11.10", anzahl: 5 },
  { tag: "12.10", anzahl: 7 },
  { tag: "13.10", anzahl: 3 },
  { tag: "14.10", anzahl: 6 },
];

export default function Dashboard() {
  const navigate = useNavigate();

  // Zählungen
  const abgeschlossen = projekte.filter((p) => p.status === "Abgeschlossen").length;
  const inArbeit = projekte.filter((p) => p.status === "In Arbeit").length;
  const geplant = projekte.filter((p) => p.status === "Geplant").length;

  const daten = [
    { name: "Abgeschlossen", value: abgeschlossen, color: "#22c55e" },
    { name: "In Arbeit", value: inArbeit, color: "#eab308" },
    { name: "Geplant", value: geplant, color: "#9ca3af" },
  ];

  // ---------------------- Live-KPI Bereich ----------------------
  const [apiOnline, setApiOnline] = useState(true);
  const [cpuUsage, setCpuUsage] = useState(32);
  const [apiCalls, setApiCalls] = useState(1250);

  // Simuliere dynamische Daten
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage((prev) => Math.max(10, Math.min(95, prev + (Math.random() * 10 - 5))));
      setApiCalls((prev) => prev + Math.floor(Math.random() * 6));
      setApiOnline(Math.random() > 0.02); // 98% online
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Live-KPI Bereich */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* API Status */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-lg transition">
          <div
            className={`w-3 h-3 rounded-full ${
              apiOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          ></div>
          <div>
            <p className="text-sm text-gray-500">API-Status</p>
            <p className={`font-semibold ${apiOnline ? "text-green-500" : "text-red-500"}`}>
              {apiOnline ? "Online" : "Offline"}
            </p>
          </div>
          <Wifi className={`ml-auto w-6 h-6 ${apiOnline ? "text-green-500" : "text-red-500"}`} />
        </div>

        {/* Systemlast */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-lg transition">
          <Cpu className="w-6 h-6 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Systemlast</p>
            <p className="font-semibold">{cpuUsage.toFixed(1)}%</p>
          </div>
          <div className="ml-auto w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${cpuUsage}%` }}
            ></div>
          </div>
        </div>

        {/* API Calls */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-lg transition">
          <Zap className="w-6 h-6 text-yellow-500" />
          <div>
            <p className="text-sm text-gray-500">API-Requests heute</p>
            <p className="font-semibold">{apiCalls.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          icon={List}
          title="Gesamtprojekte"
          value={projekte.length}
          color="text-blue-500"
          onClick={() => navigate("/projects")}
        />
        <StatCard
          icon={CheckCircle}
          title="Abgeschlossen"
          value={abgeschlossen}
          color="text-green-500"
          onClick={() => navigate("/projects")}
        />
        <StatCard
          icon={Clock}
          title="In Arbeit"
          value={inArbeit}
          color="text-yellow-500"
          onClick={() => navigate("/projects")}
        />
        <StatCard
          icon={FolderOpen}
          title="Geplant"
          value={geplant}
          color="text-gray-500"
          onClick={() => navigate("/projects")}
        />
      </div>

      {/* Diagramm + Aktivitäten nebeneinander */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {/* Diagramm */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow space-y-10">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-500" />
              Projektstatus-Verteilung
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={daten}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {daten.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    color: "white",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Aktivitätsverlauf */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Aktivität der letzten 14 Tage
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={aktivitaetDaten}>
                <XAxis dataKey="tag" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    color: "white",
                    borderRadius: "8px",
                  }}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <Line
                  type="monotone"
                  dataKey="anzahl"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Letzte Aktivitäten */}
        <div>
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Letzte Aktivitäten
          </h2>
          <ul className="space-y-3">
            {projekte.map((projekt) => (
              <li
                key={projekt.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex items-center justify-between hover:scale-[1.01] transition"
              >
                <div>
                  <p className="font-semibold">{projekt.name}</p>
                  <p className="text-sm text-gray-500">Status: {projekt.status}</p>
                </div>
                <span className="text-xs text-gray-400">{projekt.datum}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Projektübersicht */}
      <div>
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-blue-500" />
          Projektübersicht
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="text-left py-2 px-4">Projektname</th>
                <th className="text-left py-2 px-4">Status</th>
                <th className="text-left py-2 px-4">Letzte Änderung</th>
              </tr>
            </thead>
            <tbody>
              {projekte.map((projekt) => (
                <tr
                  key={projekt.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => navigate(`/projects/${projekt.id}`)}
                >
                  <td className="py-2 px-4">{projekt.name}</td>
                  <td className="py-2 px-4">{projekt.status}</td>
                  <td className="py-2 px-4 text-gray-500">{projekt.datum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Kleine wiederverwendbare Komponente für Statistik-Karten
function StatCard({ icon: Icon, title, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer p-5 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition flex flex-col items-start"
    >
      <Icon className={`w-6 h-6 mb-3 ${color}`} />
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format } from "date-fns";

function toDate(val, fallbackDays = 7) {
  if (!val) return new Date(Date.now() + fallbackDays * 86400000);
  if (val?.toDate) return val.toDate();
  return new Date(val);
}

export default function Timeline() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const qy = query(collection(db, "users", user.uid, "projects"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(qy, (snap) => setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [user?.uid]);

  // Build data: each bar is project duration (start->end). If no dates,  createdAt -> +7d.
  const data = useMemo(() => {
    return projects.map((p, idx) => {
      const start = toDate(p.startDate || p.createdAt);
      const end = toDate(p.endDate, 7);
      const days = Math.max(1, Math.round((end - start) / 86400000));
      return {
        name: p.name || `Projekt ${idx + 1}`,
        startLabel: format(start, "dd.MM"),
        endLabel: format(end, "dd.MM"),
        days,
      };
    });
  }, [projects]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Projekt-Timeline</h2>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow" style={{ height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: "currentColor" }} />
            <YAxis tick={{ fill: "currentColor" }} />
            <Tooltip formatter={(v, n, props) => [`${v} Tage`, `Dauer`]} />
            <Bar dataKey="days" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs mt-2 text-gray-600 dark:text-gray-300">
          Tipp: In „Projekte“ Start/Ende als Felder `startDate` / `endDate` ergänzen, um realistische Timelines zu sehen.
        </p>
      </div>
    </div>
  );
}

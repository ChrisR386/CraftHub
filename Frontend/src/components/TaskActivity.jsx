// src/components/TaskActivity.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Clock } from "lucide-react";

export default function TaskActivity({ taskId, userId }) {
  const [activity, setActivity] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!taskId || !userId) return;
    const ref = collection(db, "users", userId, "tasks", taskId, "activity");
    const q = query(ref, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setActivity(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [taskId, userId]);

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-500" /> Aktivitätsverlauf
      </h3>

      <div className="space-y-2 max-h-48 overflow-y-auto text-sm">
        {activity.length === 0 && (
          <p className="text-gray-500 italic">Keine Aktivitäten vorhanden.</p>
        )}
        {activity.map((a) => (
          <div
            key={a.id}
            className="p-2 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <p>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {a.author}
              </span>{" "}
              {a.text}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {a.createdAt?.toDate
                ? a.createdAt.toDate().toLocaleString()
                : "Gerade eben"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Hilfsfunktion – kann später von überall aufgerufen werden */
export async function addActivity(userId, taskId, author, text) {
  if (!userId || !taskId) return;
  const ref = collection(db, "users", userId, "tasks", taskId, "activity");
  await addDoc(ref, {
    text,
    author,
    createdAt: serverTimestamp(),
  });
}

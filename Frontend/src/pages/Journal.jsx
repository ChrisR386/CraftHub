import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, deleteDoc
} from "firebase/firestore";
import { Calendar, Save, Trash2 } from "lucide-react";
import { useNotify } from "../context/NotifyContext";
import { logActivity } from "../utils/logActivity";

const idFromDate = (d) => format(d, "yyyy-MM-dd");

export default function Journal() {
  const { user } = useAuth();
  const { push } = useNotify();
  const [entries, setEntries] = useState([]);
  const [dateStr, setDateStr] = useState(idFromDate(new Date()));
  const [text, setText] = useState("");

  useEffect(() => {
    if (!user?.uid) return;
    const qy = query(collection(db, "users", user.uid, "journal"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(qy, (snap) =>
      setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    const hit = entries.find(e => e.id === dateStr);
    setText(hit?.text || "");
  }, [dateStr, entries]);

  const save = async () => {
    if (!dateStr) return;
    await setDoc(doc(db, "users", user.uid, "journal", dateStr), {
      text,
      createdAt: serverTimestamp(),
    });
    push("Journal gespeichert", { type: "success" });
    await logActivity(user, `Journal für ${dateStr} gespeichert`, { type: "journal", refId: dateStr });
  };

  const remove = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "journal", id));
    push("Eintrag gelöscht", { type: "success" });
    await logActivity(user, `Journal-Eintrag vom ${id} gelöscht`, { type: "journal", refId: id });
  };

  const sorted = useMemo(() => entries, [entries]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dev-Journal</h2>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <label className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-300" />
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="border rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            />
          </label>
          <div className="md:ml-auto flex gap-2">
            <button onClick={save} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Save className="w-4 h-4 inline mr-1" /> Speichern
            </button>
          </div>
        </div>
        <textarea
          rows={12}
          className="w-full border rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
          placeholder={`Was hast du am ${format(parseISO(dateStr), "PPP", { locale: de })} gemacht?`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Letzte Einträge</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map(e => (
            <div key={e.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {format(parseISO(e.id), "PPP", { locale: de })}
                </p>
                <button onClick={() => remove(e.id)} className="text-red-500 hover:text-red-700" title="Löschen">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-100">{e.text}</p>
            </div>
          ))}
          {!sorted.length && (
            <p className="text-gray-600 dark:text-gray-300">Noch keine Einträge.</p>
          )}
        </div>
      </div>
    </div>
  );
}

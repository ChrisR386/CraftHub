// src/components/TaskComments.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { MoreHorizontal, Trash2, Edit2, Check, X } from "lucide-react";

export default function TaskComments({ taskId, userId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);

  // Kommentare live laden
  useEffect(() => {
    if (!taskId || !userId) return;
    const ref = collection(db, "users", userId, "tasks", taskId, "comments");
    const q = query(ref, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [taskId, userId]);

  // Kommentar hinzufügen
  const addComment = async () => {
    if (!text.trim()) return;
    const ref = collection(db, "users", userId, "tasks", taskId, "comments");
    await addDoc(ref, {
      text: text.trim(),
      author: user?.email || "Unbekannt",
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  // Kommentar löschen
  const removeComment = async (id) => {
    if (window.confirm("Kommentar wirklich löschen?")) {
      await deleteDoc(doc(db, "users", userId, "tasks", taskId, "comments", id));
    }
  };

  // Kommentar speichern (editieren)
  const saveEdit = async (id) => {
    await updateDoc(doc(db, "users", userId, "tasks", taskId, "comments", id), {
      text: editText.trim(),
    });
    setEditingId(null);
    setEditText("");
  };

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Kommentare
      </h3>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.map((c) => (
          <div
            key={c.id}
            className="relative p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            onMouseLeave={() => setMenuOpen(null)}
          >
            {/* Menü oben rechts */}
            {c.author === user?.email && (
              <div className="absolute top-2 right-2">
                <button
                  onClick={() =>
                    setMenuOpen(menuOpen === c.id ? null : c.id)
                  }
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {menuOpen === c.id && (
                  <div className="absolute right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 w-28">
                    <button
                      onClick={() => {
                        setEditingId(c.id);
                        setEditText(c.text);
                        setMenuOpen(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Edit2 className="w-3 h-3" /> Bearbeiten
                    </button>
                    <button
                      onClick={() => {
                        removeComment(c.id);
                        setMenuOpen(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="w-3 h-3" /> Löschen
                    </button>
                  </div>
                )}
              </div>
            )}

            {editingId === c.id ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full border rounded-lg px-2 py-1 text-sm"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => saveEdit(c.id)}
                    className="text-xs flex items-center gap-1 text-green-600 hover:text-green-700"
                  >
                    <Check className="w-3 h-3" /> Speichern
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditText("");
                    }}
                    className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" /> Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {c.text}
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  {c.author} •{" "}
                  {c.createdAt?.toDate
                    ? c.createdAt.toDate().toLocaleString()
                    : "Gerade eben"}
                </div>
              </>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            Noch keine Kommentare vorhanden.
          </p>
        )}
      </div>

      {/* Kommentar hinzufügen */}
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
          placeholder="Kommentar schreiben..."
          onKeyDown={(e) => e.key === "Enter" && addComment()}
        />
        <button
          onClick={addComment}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Senden
        </button>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
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
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Trash2, GripVertical } from "lucide-react";

// Status-Definitionen (Key -> Label + Farbe)
const STATI = {
  todo: { label: "To Do", color: "bg-gray-200 text-gray-800" },
  doing: { label: "In Arbeit", color: "bg-yellow-200 text-yellow-900" },
  done: { label: "Erledigt", color: "bg-green-200 text-green-900" },
};
const COLUMNS = ["todo", "doing", "done"];
const PRIORITIES = [
  { value: "low", label: "Niedrig" },
  { value: "medium", label: "Mittel" },
  { value: "high", label: "Hoch" },
];

export default function TaskBoard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");

  // Guard für nicht eingeloggte User
  if (!user) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Taskboard</h2>
        <p className="text-gray-600">
          Bitte melde dich an, um deine persönlichen Tasks zu verwalten.
        </p>
      </div>
    );
  }

  // Live-Daten aus Firestore laden
  useEffect(() => {
    const tasksRef = collection(db, "users", user.uid, "tasks");
    const q = query(tasksRef, where("archived", "==", false), orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTasks(list);
    });
    return () => unsub();
  }, [user.uid]);

  // Aufgaben nach Status gruppiert
  const tasksByStatus = useMemo(() => {
    const groups = { todo: [], doing: [], done: [] };
    for (const t of tasks) {
      const s = t.status ?? "todo";
      if (!groups[s]) groups[s] = [];
      groups[s].push(t);
    }
    return groups;
  }, [tasks]);

  // Fortschritt berechnen
  const progress = useMemo(() => {
    const total = tasks.length || 1;
    const done = tasks.filter((t) => t.status === "done").length;
    return Math.round((done / total) * 100);
  }, [tasks]);

  // Task anlegen
  const addTask = async () => {
    if (!newTitle.trim()) return;
    const tasksRef = collection(db, "users", user.uid, "tasks");
    await addDoc(tasksRef, {
      title: newTitle.trim(),
      status: "todo",
      priority: newPriority,
      createdAt: serverTimestamp(),
      archived: false,
    });
    setNewTitle("");
    setNewPriority("medium");
    setCreating(false);
  };

  // Task löschen
  const removeTask = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "tasks", id));
  };

  // Task innerhalb/zwischen Spalten verschieben
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    // Spalte (status) hat sich geändert?
    const fromCol = source.droppableId;
    const toCol = destination.droppableId;

    if (fromCol !== toCol) {
      // Status in Firestore aktualisieren
      await updateDoc(doc(db, "users", user.uid, "tasks", draggableId), {
        status: toCol,
      });
    } else {
      // Gleiche Spalte -> Reihenfolge könnte gespeichert werden (optional)
      // Aktuell ignorieren wir die Sortierung auf Spaltenebene.
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Fortschrittsanzeige */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Taskboard</h2>

        <div className="w-64">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Fortschritt</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-blue-500 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Neue Aufgabe */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        {!creating ? (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Neue Aufgabe
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-blue-200"
              placeholder="Titel der Aufgabe"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
            />
            <select
              className="border rounded-lg px-3 py-2"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={addTask}
                className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Speichern
              </button>
              <button
                onClick={() => setCreating(false)}
                className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spalten mit Drag & Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((colKey) => (
            <Droppable droppableId={colKey} key={colKey}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-xl p-4 min-h-[280px] transition ${
                    snapshot.isDraggingOver
                      ? "bg-blue-50 dark:bg-gray-700/40"
                      : "bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">
                      {STATI[colKey].label}{" "}
                      <span className="text-xs text-gray-500">
                        ({tasksByStatus[colKey]?.length ?? 0})
                      </span>
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${STATI[colKey].color}`}>
                      {STATI[colKey].label}
                    </span>
                  </div>

                  {(tasksByStatus[colKey] ?? []).map((t, index) => (
                    <Draggable draggableId={t.id} index={index} key={t.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`mb-3 p-3 rounded-lg shadow bg-white dark:bg-gray-900 border
                                      ${snapshot.isDragging ? "ring-2 ring-blue-300" : "border-gray-200 dark:border-gray-700"}`}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              {...provided.dragHandleProps}
                              className="pt-1 text-gray-400 hover:text-gray-600"
                              title="Ziehen"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <div className="flex-1">
                              <p className="font-medium">{t.title}</p>
                              <div className="mt-1 flex items-center gap-2 text-xs">
                                <span
                                  className={`px-2 py-0.5 rounded-full ${
                                    t.priority === "high"
                                      ? "bg-red-100 text-red-700"
                                      : t.priority === "medium"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {t.priority === "high"
                                    ? "Hoch"
                                    : t.priority === "medium"
                                    ? "Mittel"
                                    : "Niedrig"}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => removeTask(t.id)}
                              className="text-gray-400 hover:text-red-600"
                              title="Löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

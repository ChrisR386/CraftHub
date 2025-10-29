import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

const STATI = {
  todo: { label: "To Do" },
  doing: { label: "In Arbeit" },
  review: { label: "Review" },
  blocked: { label: "Blocked" },
  done: { label: "Done" },
};

export default function ProjektDetails() {
  const { id } = useParams(); // projectId
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    priority: "medium",
    status: "todo",
  });

  // Projekt laden (Name, Beschreibung, sharedWith)
  useEffect(() => {
    if (!user?.uid || !id) return;
    const ref = doc(db, "users", user.uid, "projects", id);
    getDoc(ref).then((snap) => {
      if (snap.exists()) setProject({ id: snap.id, ...snap.data() });
    });
  }, [user?.uid, id]);

  // Tasks live laden
  useEffect(() => {
    if (!user?.uid || !id) return;
    const ref = collection(db, "users", user.uid, "projects", id, "tasks");
    const q = query(ref, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user?.uid, id]);

  // Aktivitätslog hinzufügen
  const addActivity = async (taskId, action) => {
    const ref = collection(
      db,
      "users",
      user.uid,
      "projects",
      id,
      "tasks",
      taskId,
      "activity"
    );
    await addDoc(ref, {
      user: user.email || user.uid,
      action,
      createdAt: serverTimestamp(),
    });
  };

  // Aktivitätslog live anhängen (sichtbar unter Task)
  const [activityByTask, setActivityByTask] = useState({});
  useEffect(() => {
    if (!user?.uid || !id) return;
    // Listener je Task
    const unsubs = tasks.map((t) => {
      const aRef = collection(
        db,
        "users",
        user.uid,
        "projects",
        id,
        "tasks",
        t.id,
        "activity"
      );
      const aq = query(aRef, orderBy("createdAt", "desc"));
      return onSnapshot(aq, (snap) => {
        setActivityByTask((prev) => ({
          ...prev,
          [t.id]: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
        }));
      });
    });

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, [user?.uid, id, tasks]);

  const grouped = useMemo(() => {
    const result = Object.fromEntries(Object.keys(STATI).map((s) => [s, []]));
    for (const t of tasks) {
      const s = t.status || "todo";
      if (result[s]) result[s].push(t);
    }
    return result;
  }, [tasks]);

  const progress = useMemo(() => {
    const active = tasks.filter((t) => !t.archived);
    const total = active.length || 1;
    const done = active.filter((t) => t.status === "done").length;
    return Math.round((done / total) * 100);
  }, [tasks]);

  const addTask = async () => {
    if (!form.title.trim()) return;
    const ref = collection(db, "users", user.uid, "projects", id, "tasks");
    const newTask = {
      title: form.title.trim(),
      priority: form.priority,
      status: form.status,
      createdAt: serverTimestamp(),
      projectId: id,
    };
    const docRef = await addDoc(ref, newTask);
    await addActivity(docRef.id, "Aufgabe erstellt");
    setCreating(false);
    setForm({ title: "", priority: "medium", status: "todo" });
  };

  const deleteTask = async (taskId) => {
    await deleteDoc(doc(db, "users", user.uid, "projects", id, "tasks", taskId));
  };

  const updateStatus = async (taskId, status) => {
    await updateDoc(
      doc(db, "users", user.uid, "projects", id, "tasks", taskId),
      { status }
    );
    await addActivity(taskId, `Status geändert zu "${STATI[status]?.label || status}"`);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    await updateStatus(draggableId, destination.droppableId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {project?.name || "Projekt"}
          </h2>
          {project?.beschreibung && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {project.beschreibung}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>
      </div>

      {/* Fortschritt */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Fortschritt
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {progress}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded">
          <div
            className="h-2 bg-blue-600 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Neues Taskformular */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        {!creating ? (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Neue Aufgabe
          </button>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Titel der Aufgabe"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className="border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-blue-200 md:col-span-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              autoFocus
            />
            <select
              value={form.priority}
              onChange={(e) =>
                setForm((f) => ({ ...f, priority: e.target.value }))
              }
              className="border rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            >
              <option value="low">Niedrig</option>
              <option value="medium">Mittel</option>
              <option value="high">Hoch</option>
            </select>
            <div className="flex gap-2 justify-end">
              <button
                onClick={addTask}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Speichern
              </button>
              <button
                onClick={() => setCreating(false)}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.keys(STATI).map((colKey) => (
            <Droppable droppableId={colKey} key={colKey}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-xl p-4 min-h-[280px] border transition ${
                    snapshot.isDraggingOver
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "bg-gray-50 dark:bg-gray-800"
                  } dark:border-gray-700`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {STATI[colKey].label}
                    </h3>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {grouped[colKey]?.length || 0}
                    </span>
                  </div>

                  {grouped[colKey]?.map((t, index) => (
                    <Draggable draggableId={t.id} index={index} key={t.id}>
                      {(p) => (
                        <div
                          ref={p.innerRef}
                          {...p.draggableProps}
                          className="mb-3 p-3 rounded-lg shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {t.title}
                                </p>
                                <div
                                  {...p.dragHandleProps}
                                  className="text-gray-400 dark:text-gray-300"
                                  title="Ziehen"
                                >
                                  ⋮⋮
                                </div>
                              </div>

                              <div className="mt-2 flex items-center gap-2 text-xs">
                                <span
                                  className={`px-2 py-0.5 rounded-full ${
                                    t.priority === "high"
                                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200"
                                      : t.priority === "medium"
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                                  }`}
                                >
                                  {t.priority === "high"
                                    ? "Hoch"
                                    : t.priority === "medium"
                                    ? "Mittel"
                                    : "Niedrig"}
                                </span>
                              </div>

                              {/* Activity Log */}
                              <div className="mt-3 border-t pt-2 border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                                  Aktivität
                                </p>
                                <ul className="space-y-1">
                                  {(activityByTask[t.id] || []).map((a) => (
                                    <li
                                      key={a.id}
                                      className="text-xs text-gray-600 dark:text-gray-300"
                                    >
                                      <span className="font-medium">
                                        {a.user}:
                                      </span>{" "}
                                      {a.action}
                                    </li>
                                  ))}
                                  {!(activityByTask[t.id] || []).length && (
                                    <li className="text-xs text-gray-500">
                                      Keine Aktivitäten
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>

                            <button
                              onClick={() => deleteTask(t.id)}
                              className="text-red-500 hover:text-red-700"
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

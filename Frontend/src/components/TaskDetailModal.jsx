// src/components/TaskDetailModal.jsx
import { useState } from "react";
import { X, Trash2, Clock, UserCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import TaskComments from "./TaskComments";
import TaskActivity from "./TaskActivity";

export default function TaskDetailModal({ task, onClose, onSave, onDelete }) {
  const { user } = useAuth();
  const [form, setForm] = useState(task || {});

  if (!task) return null;

  const handleSave = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-[95%] max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
        {/* ✖️ Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 🔹 Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Aufgabe bearbeiten
          </h2>
          <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            <UserCircle2 className="w-4 h-4" />
            {form.assignedTo || user.email}
            <Clock className="w-4 h-4 ml-3" />
            {task.createdAt?.toDate
              ? task.createdAt.toDate().toLocaleString()
              : "Gerade eben erstellt"}
          </div>
        </div>

        {/* 🔧 Formular */}
        <div className="space-y-3">
          <input
            type="text"
            value={form.title || ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Titel"
          />

          <textarea
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 h-24"
            placeholder="Beschreibung"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="flex-1 border rounded-lg px-3 py-2"
              value={form.priority || "medium"}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Niedrig</option>
              <option value="medium">Mittel</option>
              <option value="high">Hoch</option>
            </select>

            <select
              className="flex-1 border rounded-lg px-3 py-2"
              value={form.status || "todo"}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="todo">To Do</option>
              <option value="doing">In Arbeit</option>
              <option value="review">Review</option>
              <option value="blocked">Blocked</option>
              <option value="done">Erledigt</option>
            </select>

            <input
              type="date"
              className="flex-1 border rounded-lg px-3 py-2"
              value={form.dueDate || ""}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
        </div>

        {/* 🔥 Kommentar- & Aktivitätsbereich */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          {/* Kommentare */}
          <TaskComments taskId={task.id} userId={user.uid} />

          {/* Aktivitäten */}
          <TaskActivity taskId={task.id} userId={user.uid} />
        </div>

        {/* ⚙️ Footer */}
        <div className="mt-6 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => onDelete(task.id)}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Löschen
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

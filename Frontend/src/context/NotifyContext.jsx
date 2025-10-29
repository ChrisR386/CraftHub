import { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const NotifyContext = createContext(null);
export const useNotify = () => useContext(NotifyContext);

export function NotifyProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const { user } = useAuth();

  const push = useCallback(
    async (message, { persist = false, type = "info" } = {}) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, message, type }]);

      if (persist && user?.uid) {
        try {
          await addDoc(collection(db, "users", user.uid, "notifications"), {
            message,
            type,
            createdAt: serverTimestamp(),
            read: false,
          });
        } catch (e) {
          console.warn("Notify persist failed:", e);
        }
      }

      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 4000);
    },
    [user?.uid]
  );

  return (
    <NotifyContext.Provider value={{ push }}>
      {children}
      {/* Toast-Stack */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow text-white ${
              t.type === "error"
                ? "bg-rose-600"
                : t.type === "success"
                ? "bg-emerald-600"
                : "bg-slate-800"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </NotifyContext.Provider>
  );
}

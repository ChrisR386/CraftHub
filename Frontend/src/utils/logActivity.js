import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Schreibt einen Log-Eintrag in Firestore: users/{uid}/activity
 * @param {Object} user  useAuth().user
 * @param {string} action  z.B. 'Projekt "X" erstellt'
 * @param {Object} meta  z.B. { type:'project'|'snippet'|'journal'|'task', refId:'abc123' }
 */
export async function logActivity(user, action, meta = {}) {
  if (!user?.uid) return;
  try {
    await addDoc(collection(db, "users", user.uid, "activity"), {
      user: user.displayName || user.email || user.uid,
      action,
      meta,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Fehler beim Loggen:", err);
  }
}

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  addDoc, collection, deleteDoc, doc,
  onSnapshot, orderBy, query, serverTimestamp, updateDoc
} from "firebase/firestore";
import { Copy, Plus, Save, Search, Tag, Trash2, XCircle } from "lucide-react";
import { useNotify } from "../context/NotifyContext";
import { logActivity } from "../utils/logActivity";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import jsonLang from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("json", jsonLang);
SyntaxHighlighter.registerLanguage("xml", xml);

const LANGS = ["javascript", "json", "xml", "bash", "python", "tsx", "jsx"];

export default function Snippets() {
  const { user } = useAuth();
  const { push } = useNotify();
  const [search, setSearch] = useState("");
  const [snips, setSnips] = useState([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", code: "", lang: "javascript", tags: "" });
  const dark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  useEffect(() => {
    if (!user?.uid) return;
    const qy = query(collection(db, "users", user.uid, "snippets"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(qy, (snap) => setSnips(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [user?.uid]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return snips.filter(s =>
      (s.title || "").toLowerCase().includes(q) ||
      (s.tags || []).join(",").toLowerCase().includes(q) ||
      (s.code || "").toLowerCase().includes(q)
    );
  }, [snips, search]);

  const saveNew = async () => {
    if (!form.title.trim() || !form.code.trim()) return;
    const ref = collection(db, "users", user.uid, "snippets");
    const docRef = await addDoc(ref, {
      title: form.title.trim(),
      code: form.code,
      lang: form.lang,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      createdAt: serverTimestamp(),
    });
    push("Snippet gespeichert", { type: "success" });
    await logActivity(user, `Snippet "${form.title}" erstellt`, { type: "snippet", refId: docRef.id });
    setForm({ title: "", code: "", lang: "javascript", tags: "" });
    setCreating(false);
  };

  const saveEdit = async (id) => {
    await updateDoc(doc(db, "users", user.uid, "snippets", id), {
      title: form.title.trim(),
      code: form.code,
      lang: form.lang,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    push("Snippet aktualisiert", { type: "success" });
    await logActivity(user, `Snippet "${form.title}" aktualisiert`, { type: "snippet", refId: id });
    setEditing(null);
    setForm({ title: "", code: "", lang: "javascript", tags: "" });
  };

  const remove = async (id, title) => {
    await deleteDoc(doc(db, "users", user.uid, "snippets", id));
    push("Snippet gelöscht", { type: "success" });
    await logActivity(user, `Snippet "${title || ""}" gelöscht`, { type: "snippet", refId: id });
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code || "");
      push("In die Zwischenablage kopiert", { type: "success" });
    } catch {
      push("Kopieren fehlgeschlagen", { type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Snippets</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suche in Titel, Tags, Code…"
              className="pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring focus:ring-blue-200 outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
          {!creating && (
            <button onClick={() => setCreating(true)} className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Neues Snippet
            </button>
          )}
        </div>
      </div>

      {creating && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input className="border rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" placeholder="Titel"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select className="border rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              value={form.lang} onChange={(e) => setForm({ ...form, lang: e.target.value })}>
              {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input className="border rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" placeholder="Tags (Komma-getrennt)"
              value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            <div className="flex gap-2 justify-end">
              <button onClick={saveNew} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Save className="w-4 h-4 inline mr-1" />Speichern</button>
              <button onClick={() => setCreating(false)} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"><XCircle className="w-4 h-4 inline mr-1" />Abbrechen</button>
            </div>
          </div>
          <textarea rows={10} className="w-full border rounded-lg px-3 py-2 font-mono dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            placeholder="// Code hier…" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(s => (
          <div key={s.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
            {editing === s.id ? (
              <>
                <input className="w-full border rounded-lg px-3 py-2 mb-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <select className="border rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    value={form.lang} onChange={(e) => setForm({ ...form, lang: e.target.value })}>
                    {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <input className="border rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags" />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => saveEdit(s.id)} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Save className="w-4 h-4 inline mr-1" />Speichern</button>
                    <button onClick={() => setEditing(null)} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"><XCircle className="w-4 h-4 inline mr-1" />Cancel</button>
                  </div>
                </div>
                <textarea rows={8} className="w-full border rounded-lg px-3 py-2 font-mono dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{s.title}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(s.id); setForm({ title: s.title, code: s.code, lang: s.lang, tags: (s.tags || []).join(", ") }); }}
                      className="px-2 py-1 text-sm rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">Bearbeiten</button>
                    <button onClick={() => remove(s.id, s.title)} className="px-2 py-1 text-sm rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200">Löschen</button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-700 dark:text-gray-300">
                  <Tag className="w-3 h-3" />
                  {(s.tags || []).length ? (s.tags || []).join(", ") : "keine Tags"}
                </div>
                <div className="relative">
                  <button onClick={() => copyCode(s.code)} title="Kopieren"
                    className="absolute right-2 top-2 p-1 rounded bg-black/50 text-white hover:bg-black/70">
                    <Copy className="w-4 h-4" />
                  </button>
                  <SyntaxHighlighter language={s.lang} style={dark ? atomOneDark : atomOneLight} customStyle={{ borderRadius: 8, paddingTop: 28 }} wrapLongLines>
                    {s.code}
                  </SyntaxHighlighter>
                </div>
              </>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-gray-600 dark:text-gray-300 text-sm col-span-full text-center">
            Keine Snippets gefunden.
          </p>
        )}
      </div>
    </div>
  );
}

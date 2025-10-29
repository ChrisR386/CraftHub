// src/pages/CodeTester.jsx
import { useEffect, useRef, useState } from "react";
import CodeEditor from "../components/CodeEditor";

export default function CodeTester() {
  const [language, setLanguage] = useState("python"); // 'python' | 'javascript'
  const [code, setCode] = useState(`print("Hallo Welt")`);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const pyodideRef = useRef(null);
  const [pyReady, setPyReady] = useState(false);

  // Pyodide lazy laden (einmalig)
  useEffect(() => {
    let cancelled = false;
    async function loadPy() {
      if (pyodideRef.current || typeof window === "undefined" || !window.loadPyodide) return;
      try {
        const py = await window.loadPyodide({
          stdin: () => null,
          // stdout/err leiten wir in runPython selbst ab
        });
        if (cancelled) return;
        pyodideRef.current = py;
        setPyReady(true);
      } catch (e) {
        console.error("Pyodide konnte nicht geladen werden:", e);
      }
    }
    loadPy();
    return () => {
      cancelled = true;
    };
  }, []);

  const runJS = async (userCode) => {
    // 'print' auf console.log mappen, um window.print() zu verhindern
    const wrapped = `(function(){ const print = (...args)=>console.log(...args); ${userCode}\n})()`;
    const start = performance.now();
    let logs = [];
    const originalLog = console.log;
    try {
      console.log = (...args) => {
        logs.push(args.map(String).join(" "));
        originalLog(...args);
      };
      // Sicherer als eval: Function-Constructor ohne Zugriff auf lokalen Scope
      // eslint-disable-next-line no-new-func
      const fn = new Function(wrapped);
      fn();
      const elapsed = Math.round(performance.now() - start);
      return { stdout: logs.join("\n"), error: "", elapsed };
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      return { stdout: logs.join("\n"), error: String(err), elapsed };
    } finally {
      console.log = originalLog;
    }
  };

  const runPython = async (userCode) => {
    if (!pyodideRef.current) {
      return { stdout: "", error: "Python-Laufzeit wird noch geladen…", elapsed: 0 };
    }
    const pyodide = pyodideRef.current;
    const start = performance.now();
    try {
      // Python: stdout puffern, exec ausführen, Ergebnis als JSON zurückgeben
      const pyWrapper = `
import sys, io, time, json
buf = io.StringIO()
_stdout = sys.stdout
sys.stdout = buf
start = time.time()
err = ""
try:
    exec(${JSON.stringify(userCode)}, {})
except Exception as e:
    err = str(e)
finally:
    sys.stdout = _stdout
elapsed = int((time.time() - start) * 1000)
json.dumps({"stdout": buf.getvalue(), "error": err, "elapsed": elapsed})
      `.trim();

      const jsonStr = await pyodide.runPythonAsync(pyWrapper);
      const res = JSON.parse(jsonStr);
      // Fallback: falls elapsed hier 0 ist, messen wir auch im JS
      if (!res.elapsed) res.elapsed = Math.round(performance.now() - start);
      return res;
    } catch (e) {
      const elapsed = Math.round(performance.now() - start);
      return { stdout: "", error: String(e), elapsed };
    }
  };

  const runCode = async () => {
    setRunning(true);
    setOutput("");
    const runner = language === "python" ? runPython : runJS;
    const res = await runner(code);
    let out = "";
    if (res.stdout) out += res.stdout;
    if (res.error) out += (out ? "\n" : "") + `Error: ${res.error}`;
    out += (out ? "\n" : "") + `\n⏱️ ${res.elapsed} ms`;
    setOutput(out.trim());
    setRunning(false);
  };

  // Beispiel-Code beim Sprachwechsel
  useEffect(() => {
    if (language === "python") {
      setCode(`for i in range(3):\n    print("Hallo", i)\n`);
    } else {
      setCode(`print("Hallo Welt");\n// oder:\n// console.log("Hallo Welt");`);
    }
  }, [language]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Code Tester</h2>
        <div className="flex gap-3 items-center">
          <select
            className="border rounded-lg px-3 py-2"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="python">Python (Pyodide)</option>
            <option value="javascript">JavaScript (Sandbox)</option>
          </select>
          <button
            onClick={runCode}
            disabled={running || (language === "python" && !pyReady)}
            className={`px-4 py-2 rounded-lg text-white ${running ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            title={language === "python" && !pyReady ? "Python-Laufzeit lädt…" : "Code ausführen"}
          >
            {running ? "Läuft…" : "Code ausführen"}
          </button>
        </div>
      </div>

      {/* Editor */}
      <CodeEditor code={code} setCode={setCode} language={language === "python" ? "python" : "javascript"} />

      {/* Output */}
      <div className="bg-black text-green-200 rounded-xl p-4 shadow-inner min-h-[160px] whitespace-pre-wrap">
        {output || (language === "python" && !pyReady ? "⏳ Lade Python-Laufzeit…" : "— Ausgabe erscheint hier —")}
      </div>
    </div>
  );
}

// src/components/CodeEditor.jsx
import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-python";
import "prismjs/components/prism-json";

export default function CodeEditor({ code, setCode, language = "javascript" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    Prism.highlightAllUnder(ref.current);
  }, [code, language]);

  return (
    <div ref={ref} className="rounded-xl border border-gray-300 bg-white overflow-hidden">
      <div className="px-3 py-2 text-xs bg-gray-100 border-b border-gray-200">
        Sprache: <span className="font-mono">{language}</span>
      </div>
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full min-h-[260px] p-3 font-mono text-sm outline-none bg-transparent text-gray-800"
        />
      </div>
    </div>
  );
}

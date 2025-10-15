import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function ApiTest() {
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResponse("");
    try {
      const res = await fetch(url);
      const text = await res.text();
      setResponse(text);
    } catch (err) {
      setResponse(`Fehler: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">API-Testbereich</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">API-URL:</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border rounded-lg p-2 text-sm focus:ring focus:ring-blue-200 outline-none dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      <button
        onClick={handleTest}
        disabled={loading}
        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Wird gesendet..." : "API testen"}
      </button>

      {/* Antwortbereich */}
      <div className="mt-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
        <h3 className="font-semibold mb-2">Antwort:</h3>
        {response ? (
          <SyntaxHighlighter
            language="json"
            style={darkMode ? oneDark : oneLight}
            wrapLongLines={true}
            customStyle={{
              background: "transparent",
              fontSize: "0.9rem",
              padding: "1rem",
              borderRadius: "0.5rem",
            }}
          >
            {(() => {
              try {
                return JSON.stringify(JSON.parse(response), null, 2);
              } catch {
                return response;
              }
            })()}
          </SyntaxHighlighter>
        ) : (
          <p className="text-gray-500">Noch keine Anfrage gesendet.</p>
        )}
      </div>
    </div>
  );
}

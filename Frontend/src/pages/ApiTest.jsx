import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

export default function ApiTest() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!url) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json" },
      };

      if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">API-Testbereich</h1>

      {/* Eingabefelder */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700"
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
            <option>DELETE</option>
          </select>

          <input
            type="text"
            placeholder="API-Endpunkt (z. B. https://api.example.com/data)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700"
          />

          <button
            onClick={handleSend}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sende...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Senden
              </>
            )}
          </button>
        </div>

        {/* Body (optional) */}
        {["POST", "PUT", "PATCH"].includes(method) && (
          <textarea
            placeholder='JSON-Body (optional, z. B. {"name":"Test"})'
            rows="5"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 font-mono text-sm"
          />
        )}
      </div>

      {/* Antwortbereich */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Antwort</h2>

        {error && (
          <p className="text-red-500 font-medium">Fehler: {error}</p>
        )}

        {!error && !response && !isLoading && (
          <p className="text-gray-500">Noch keine Anfrage gesendet.</p>
        )}

        {isLoading && (
          <p className="text-gray-500 animate-pulse">Wird gesendet...</p>
        )}

        {response && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">
              Status:{" "}
              <span className="font-semibold">
                {response.status} {response.statusText}
              </span>
            </p>

            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
              {typeof response.data === "object"
                ? JSON.stringify(response.data, null, 2)
                : response.data}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConsoleOutput({ output }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 shadow-md border border-gray-300 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Konsole</h3>
      <pre className="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">
        {output || "💡 Ausgabe erscheint hier..."}
      </pre>
    </div>
  );
}

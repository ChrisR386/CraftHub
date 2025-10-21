export default function Einstellungen({ darkMode, setDarkMode }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Einstellungen</h2>

      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Design</div>
            <div className="text-sm text-gray-500">Wähle zwischen Dunkel- und Hellmodus</div>
          </div>

          <div>
            <button
              onClick={() => setDarkMode(false)}
              className={`px-3 py-1 rounded mr-2 ${!darkMode ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              Hell
            </button>
            <button
              onClick={() => setDarkMode(true)}
              className={`px-3 py-1 rounded ${darkMode ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              Dunkel
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="font-semibold mb-2">Profil</div>
        <p className="text-sm text-gray-500">Hier kannst du später Profil-Daten anzeigen / bearbeiten.</p>
      </div>
    </div>
  );
}

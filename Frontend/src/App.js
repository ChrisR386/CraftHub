import React, { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Lade...");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/test")
      .then((res) => res.json())
      .then((data) => setMessage(data.info))
      .catch(() => setMessage("Fehler beim Verbinden mit dem Backend"));
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center", marginTop: "50px" }}>
      <h1>CraftHub</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;

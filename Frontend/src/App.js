import React, { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Lade...");

  useEffect(() => {
    fetch("/").then(res => res.json()).then(data => {
      setMessage(data.message);
    });
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>CraftHub Test</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
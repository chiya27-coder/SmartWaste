import { useMemo, useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import Inventory from "./pages/Inventory.jsx";
import { mockInventory } from "./data/mockInventory.js";

export default function App() {
  const [page, setPage] = useState("dashboard");

  // stateful inventory list (starts from mock data)
  const [inventory, setInventory] = useState(mockInventory);

  // helper actions
  const actions = useMemo(() => {
    return {
      addItem(newItem) {
        setInventory((prev) => [{ ...newItem, id: Date.now() }, ...prev]);
      },
      removeItem(id) {
        setInventory((prev) => prev.filter((x) => x.id !== id));
      },
    };
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, Arial" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0 }}>SmartWaste</h1>
        <p style={{ marginTop: "0.5rem" }}>
          Food waste reduction system for small cafés and restaurants.
        </p>

        <nav style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
          <button onClick={() => setPage("dashboard")}>Dashboard</button>
          <button onClick={() => setPage("inventory")}>Inventory</button>
        </nav>
      </header>

      <main>
        {page === "dashboard" && <Dashboard inventory={inventory} />}
        {page === "inventory" && (
          <Inventory inventory={inventory} actions={actions} />
        )}
      </main>
    </div>
  );
}

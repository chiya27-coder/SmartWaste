import { useMemo, useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import Inventory from "./pages/Inventory.jsx";

const seed = [
  { id: 1, name: "Milk", quantity: 8, unit: "L", expiry: "2026-01-22" },
  { id: 2, name: "Chicken breast", quantity: 12, unit: "pcs", expiry: "2026-01-20" },
  { id: 3, name: "Tomatoes", quantity: 30, unit: "pcs", expiry: "2026-01-19" },
];

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full flex-col items-center justify-center gap-1 py-3 text-xs font-semibold transition
      ${active ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
    >
      <span
        className={`h-1.5 w-10 rounded-full transition ${
          active ? "bg-white" : "bg-transparent"
        }`}
      />
      <span>{label}</span>
    </button>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [inventory, setInventory] = useState(seed);

  const actions = useMemo(
    () => ({
      addItem: (item) =>
        setInventory((prev) => [{ id: Date.now(), ...item }, ...prev]),
      removeItem: (id) => setInventory((prev) => prev.filter((x) => x.id !== id)),
    }),
    []
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight">SmartWaste</h1>
              <p className="mt-1 hidden text-sm text-slate-300 sm:block">
                Food waste reduction system for small cafés and restaurants.
              </p>
            </div>

            {/* Desktop tabs */}
            <nav className="hidden gap-2 sm:flex">
              <button
                onClick={() => setPage("dashboard")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition
                ${page === "dashboard" ? "bg-white text-slate-900" : "bg-slate-800 text-slate-100 hover:bg-slate-700"}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setPage("inventory")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition
                ${page === "inventory" ? "bg-white text-slate-900" : "bg-slate-800 text-slate-100 hover:bg-slate-700"}`}
              >
                Inventory
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-5xl px-4 py-6 pb-24">
        {page === "dashboard" ? (
          <Dashboard inventory={inventory} />
        ) : (
          <Inventory inventory={inventory} actions={actions} />
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/90 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-5xl">
          <TabButton
            label="Dashboard"
            active={page === "dashboard"}
            onClick={() => setPage("dashboard")}
          />
          <TabButton
            label="Inventory"
            active={page === "inventory"}
            onClick={() => setPage("inventory")}
          />
        </div>
      </nav>
    </div>
  );
}
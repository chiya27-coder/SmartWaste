import { useMemo, useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import Inventory from "./pages/Inventory.jsx";
import Logs from "./pages/Logs.jsx";

const seed = [
  { id: 1, name: "Milk", quantity: 8, unit: "L", expiry: "2026-01-22" },
  { id: 2, name: "Chicken breast", quantity: 12, unit: "pcs", expiry: "2026-01-20" },
  { id: 3, name: "Tomatoes", quantity: 30, unit: "pcs", expiry: "2026-01-19" },
];

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-center py-3 text-sm font-semibold transition ${
        active ? "text-green-700" : "text-gray-500 hover:text-gray-700"
      }`}
      type="button"
    >
      {label}
    </button>
  );
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, 100%)",
          padding: 16,
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          background: "white",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid #e5e7eb",
              background: "white",
              borderRadius: 10,
              padding: "8px 12px",
              fontWeight: 700,
            }}
          >
            Close
          </button>
        </div>

        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [inventory, setInventory] = useState(seed);

  // Waste log entries: {id, itemId, name, quantity, unit, expiry, outcome, notes, atISO}
  const [wasteLog, setWasteLog] = useState([]);

  // Modal state
  const [logOpen, setLogOpen] = useState(false);
  const [logItem, setLogItem] = useState(null);

  const actions = useMemo(
    () => ({
      addItem: (item) => setInventory((prev) => [{ id: Date.now(), ...item }, ...prev]),

      // Backwards-compatible remove: if Inventory calls removeItem(id)
      removeItem: (id) => {
        setInventory((prev) => {
          const found = prev.find((x) => x.id === id);
          if (found) {
            setLogItem(found);
            setLogOpen(true);
          }
          return prev;
        });
      },

      // Preferred: Inventory can call requestRemove(item)
      requestRemove: (item) => {
        setLogItem(item);
        setLogOpen(true);
      },

      removeItemNow: (id) => setInventory((prev) => prev.filter((x) => x.id !== id)),

      addWasteLog: (entry) => setWasteLog((prev) => [{ id: Date.now(), ...entry }, ...prev]),
    }),
    []
  );

  function closeLog() {
    setLogOpen(false);
    setLogItem(null);
  }

  function submitLog({ outcome, notes }) {
    if (!logItem) return;

    actions.addWasteLog({
      itemId: logItem.id,
      name: logItem.name,
      quantity: logItem.quantity,
      unit: logItem.unit,
      expiry: logItem.expiry,
      outcome, // "sold_used" | "donated" | "wasted"
      notes: notes || "",
      atISO: new Date().toISOString(),
    });

    actions.removeItemNow(logItem.id);
    closeLog();
  }

  return (
    <div className="min-h-screen" style={{ background: "#f6fbf7" }}>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto w-full max-w-5xl px-4" style={{ paddingTop: 12, paddingBottom: 12 }}>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-extrabold">SmartWaste</h1>
              <p className="mt-1 hidden text-sm text-gray-600 sm:block">
                Reduce food waste with expiry prioritisation and action logging.
              </p>
            </div>

            {/* Desktop nav */}
            <nav className="hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={() => setPage("dashboard")}
                className={`btn ${page === "dashboard" ? "btn-primary" : "btn-ghost"}`}
              >
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => setPage("inventory")}
                className={`btn ${page === "inventory" ? "btn-primary" : "btn-ghost"}`}
              >
                Inventory
              </button>

              <button
                type="button"
                onClick={() => setPage("logs")}
                className={`btn ${page === "logs" ? "btn-primary" : "btn-ghost"}`}
              >
                Logs
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4" style={{ paddingTop: 18, paddingBottom: 90 }}>
        {page === "dashboard" ? (
          <Dashboard inventory={inventory} wasteLog={wasteLog} />
        ) : page === "inventory" ? (
          <Inventory inventory={inventory} actions={actions} />
        ) : (
          <Logs wasteLog={wasteLog} />
        )}
      </main>

      {/* Mobile nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-5xl">
          <TabButton label="Dashboard" active={page === "dashboard"} onClick={() => setPage("dashboard")} />
          <TabButton label="Inventory" active={page === "inventory"} onClick={() => setPage("inventory")} />
          <TabButton label="Logs" active={page === "logs"} onClick={() => setPage("logs")} />
        </div>
      </nav>

      {/* Waste logging modal */}
      <Modal open={logOpen} title="Log item outcome" onClose={closeLog}>
        {!logItem ? null : <WasteLogForm item={logItem} onCancel={closeLog} onSubmit={submitLog} />}
      </Modal>
    </div>
  );
}

function WasteLogForm({ item, onCancel, onSubmit }) {
  const [outcome, setOutcome] = useState("sold_used");
  const [notes, setNotes] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ outcome, notes });
      }}
      style={{ display: "grid", gap: 12 }}
    >
      <div
        style={{
          padding: 12,
          borderRadius: 14,
          border: "1px solid #e5e7eb",
          background: "#f9fafb",
        }}
      >
        <div style={{ fontWeight: 900 }}>{item.name}</div>
        <div style={{ marginTop: 6, color: "#4B5563", fontSize: 14 }}>
          {item.quantity} {item.unit} • Expiry: {item.expiry}
        </div>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#374151" }}>Outcome</div>

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="radio"
              name="outcome"
              value="sold_used"
              checked={outcome === "sold_used"}
              onChange={() => setOutcome("sold_used")}
            />
            Sold / Used (saved)
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="radio"
              name="outcome"
              value="donated"
              checked={outcome === "donated"}
              onChange={() => setOutcome("donated")}
            />
            Donated (saved)
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="radio"
              name="outcome"
              value="wasted"
              checked={outcome === "wasted"}
              onChange={() => setOutcome("wasted")}
            />
            Wasted (discarded)
          </label>
        </div>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#374151" }}>Notes (optional)</div>
        <textarea
          style={{
            minHeight: 90,
            resize: "vertical",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 10,
          }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Spoiled due to delivery delay; used in soup special; donated end of day."
        />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="submit"
          style={{
            background: "#16a34a",
            color: "white",
            border: "1px solid #15803d",
            borderRadius: 12,
            padding: "10px 14px",
            fontWeight: 800,
          }}
        >
          Save log & remove
        </button>

        <button
          type="button"
          onClick={onCancel}
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: "10px 14px",
            fontWeight: 800,
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
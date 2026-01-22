import { useMemo, useState } from "react";
import { getExpiryStatus } from "../utils/risk.js";

/* ---------- UI helpers ---------- */

function Badge({ tone, children }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
    border: "1px solid",
    whiteSpace: "nowrap",
  };

  const tones =
    tone === "danger"
      ? { background: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }
      : tone === "warning"
      ? { background: "#fef3c7", borderColor: "#fcd34d", color: "#92400e" }
      : { background: "#dcfce7", borderColor: "#86efac", color: "#166534" };

  return <span style={{ ...base, ...tones }}>{children}</span>;
}

function Field({ label, children }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 800, color: "#374151" }}>{label}</label>
      {children}
    </div>
  );
}

/* ---------- Main component ---------- */

export default function Inventory({ inventory, actions }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("pcs");
  const [expiry, setExpiry] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter an item name.");
    if (!expiry) return alert("Please select an expiry date.");

    actions.addItem({
      name: name.trim(),
      quantity: Number(quantity),
      unit: unit.trim() || "pcs",
      expiry,
    });

    setName("");
    setQuantity(1);
    setUnit("pcs");
    setExpiry("");
  }

  const sorted = useMemo(() => {
    const score = (exp) => {
      const s = getExpiryStatus(exp);
      return s.tone === "danger" ? 3 : s.tone === "warning" ? 2 : 1;
    };
    return [...inventory].sort((a, b) => score(b.expiry) - score(a.expiry));
  }, [inventory]);

  return (
    <div className="container" style={{ paddingLeft: 0, paddingRight: 0 }}>
      {/* ---------- Header ---------- */}
      <h2 style={{ fontSize: 32, marginBottom: 6 }}>Inventory</h2>
      <p style={{ color: "#4b5563" }}>
        Add items and view expiry-risk status. Updates reflect on the dashboard.
      </p>

      {/* ---------- Add item ---------- */}
      <section className="card" style={{ marginTop: 18, overflow: "hidden" }}>
        <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Add item</div>
          <div style={{ marginTop: 4, color: "#6b7280", fontSize: 14 }}>
            Keep stock updated to reduce waste.
          </div>
        </div>

        <form onSubmit={onSubmit} style={{ padding: 16, display: "grid", gap: 14 }}>
          <Field label="Item name">
            <input
              className="input"
              placeholder="e.g. Milk"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <Field label="Quantity">
              <input
                className="input"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Field>

            <Field label="Unit">
              <input
                className="input"
                placeholder="pcs / L / kg"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </Field>

            <Field label="Expiry">
              <input
                className="input"
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </Field>
          </div>

          {/* ---------- Action bar ---------- */}
          <div
            style={{
              marginTop: 6,
              padding: 12,
              borderRadius: 14,
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <button className="btn btn-primary" type="submit">
              Add item
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              style={{ color: "#065f46", fontWeight: 700 }}
              onClick={() => {
                setName("");
                setQuantity(1);
                setUnit("pcs");
                setExpiry("");
              }}
            >
              Clear form
            </button>
          </div>
        </form>
      </section>

      {/* ---------- Current items ---------- */}
      <section className="card" style={{ marginTop: 18 }}>
        <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Current items</div>
          <div style={{ marginTop: 4, color: "#6b7280", fontSize: 14 }}>
            Sorted by risk (overdue first). Remove to log an outcome.
          </div>
        </div>

        <div style={{ padding: 16, display: "grid", gap: 12 }}>
          {sorted.length === 0 && (
            <div style={{ color: "#6b7280" }}>No items yet.</div>
          )}

          {sorted.map((item) => {
            const status = getExpiryStatus(item.expiry);
            const label =
              status.tone === "ok"
                ? "OK"
                : `${status.label} (${status.days}d)`;

            return (
              <div
                key={item.id}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{item.name}</div>
                  <div style={{ marginTop: 6, fontSize: 14, color: "#4b5563" }}>
                    <strong>{item.quantity}</strong> {item.unit} • Expiry:{" "}
                    {item.expiry}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Badge tone={status.tone}>{label}</Badge>
                  </div>
                </div>

                <button
                  className="btn btn-ghost"
                  onClick={() => actions.requestRemove(item)}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- Responsive ---------- */}
      <style>{`
        @media (max-width: 700px) {
          form > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
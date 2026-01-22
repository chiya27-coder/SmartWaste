import { useState } from "react";
import { getExpiryStatus } from "../utils/risk.js";

function Badge({ tone, children }) {
  const styles = {
    display: "inline-block",
    padding: "0.2rem 0.5rem",
    borderRadius: "999px",
    fontSize: "0.85rem",
    border: "1px solid #ddd",
  };

  const toneStyles =
    tone === "danger"
      ? { background: "#ffe5e5", borderColor: "#ffb3b3" }
      : tone === "warning"
      ? { background: "#fff2cc", borderColor: "#ffe08a" }
      : { background: "#e8f5e9", borderColor: "#b7e0bd" };

  return <span style={{ ...styles, ...toneStyles }}>{children}</span>;
}

function isValidISODate(iso) {
  // must be YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;

  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(iso);

  // Check date is real and matches components (avoids 2026-02-31 becoming March)
  return (
    dt instanceof Date &&
    !Number.isNaN(dt.valueOf()) &&
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() + 1 === m &&
    dt.getUTCDate() === d
  );
}

export default function Inventory({ inventory, actions }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("pcs");
  const [expiry, setExpiry] = useState(""); // YYYY-MM-DD text

  function onSubmit(e) {
    e.preventDefault();

    if (!name.trim()) return alert("Please enter an item name.");

    if (!expiry.trim()) return alert("Please enter an expiry date (YYYY-MM-DD).");
    if (!isValidISODate(expiry.trim()))
      return alert("Expiry must be a real date in YYYY-MM-DD format (e.g. 2026-01-22).");

    if (Number.isNaN(Number(quantity)) || Number(quantity) <= 0)
      return alert("Quantity must be a positive number.");

    actions.addItem({
      name: name.trim(),
      quantity: Number(quantity),
      unit: unit.trim() || "pcs",
      expiry: expiry.trim(),
    });

    setName("");
    setQuantity(1);
    setUnit("pcs");
    setExpiry("");
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div>
      <h2>Inventory</h2>
      <p>Add items and view expiry-risk status. Updates reflect on Dashboard.</p>

      <form
        onSubmit={onSubmit}
        style={{
          marginTop: "1rem",
          marginBottom: "1.25rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "12px",
          display: "grid",
          gap: "0.75rem",
          maxWidth: "700px",
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <div style={{ display: "grid", gap: "0.25rem", minWidth: 0 }}>
          <label>Item name</label>
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Responsive grid avoids iOS overflow */}
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            alignItems: "end",
            minWidth: 0,
          }}
          className="inv-grid"
        >
          <div style={{ display: "grid", gap: "0.25rem", minWidth: 0 }}>
            <label>Quantity</label>
            <input
              style={inputStyle}
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gap: "0.25rem", minWidth: 0 }}>
            <label>Unit</label>
            <input
              style={inputStyle}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gap: "0.25rem", minWidth: 0 }}>
            <label>Expiry (YYYY-MM-DD)</label>
            <input
              style={inputStyle}
              type="text"
              inputMode="numeric"
              placeholder="2026-01-22"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
          </div>
        </div>

        <style>{`
          @media (max-width: 600px) {
            .inv-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        <div>
          <button type="submit">Add item</button>
        </div>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
            <th style={{ padding: "0.75rem 0.5rem" }}>Item</th>
            <th style={{ padding: "0.75rem 0.5rem" }}>Quantity</th>
            <th style={{ padding: "0.75rem 0.5rem" }}>Expiry</th>
            <th style={{ padding: "0.75rem 0.5rem" }}>Status</th>
            <th style={{ padding: "0.75rem 0.5rem" }}></th>
          </tr>
        </thead>

        <tbody>
          {inventory.map((item) => {
            const status = getExpiryStatus(item.expiry);

            return (
              <tr key={item.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  <strong>{item.name}</strong>
                </td>
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  {item.quantity} {item.unit}
                </td>
                <td style={{ padding: "0.75rem 0.5rem" }}>{item.expiry}</td>
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  <Badge tone={status.tone}>
                    {status.label}
                    {status.tone !== "ok" ? ` (${status.days}d)` : ""}
                  </Badge>
                </td>
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  <button onClick={() => actions.removeItem(item.id)}>Remove</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
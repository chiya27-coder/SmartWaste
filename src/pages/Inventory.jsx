import { useMemo, useState } from "react";
import { getExpiryStatus } from "../utils/risk.js";

function Section({ title, subtitle, children }) {
  return (
    <section
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        background: "white",
        boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: 16, borderBottom: "1px solid #E5E7EB" }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#111827" }}>{title}</div>
        {subtitle ? (
          <div style={{ marginTop: 4, fontSize: 14, color: "#6B7280" }}>{subtitle}</div>
        ) : null}
      </div>

      <div style={{ padding: 16 }}>{children}</div>
    </section>
  );
}

function Badge({ tone, children }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "0.85rem",
    border: "1px solid",
    fontWeight: 800,
    whiteSpace: "nowrap",
  };

  const toneStyles =
    tone === "danger"
      ? { background: "#FEE2E2", borderColor: "#FCA5A5", color: "#991B1B" }
      : tone === "warning"
      ? { background: "#FEF3C7", borderColor: "#FCD34D", color: "#92400E" }
      : { background: "#DCFCE7", borderColor: "#86EFAC", color: "#166534" };

  return <span style={{ ...base, ...toneStyles }}>{children}</span>;
}

function Field({ label, children }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#374151" }}>{label}</div>
      {children}
    </div>
  );
}

function statusRank(tone) {
  return tone === "danger" ? 0 : tone === "warning" ? 1 : 2;
}

export default function Inventory({ inventory, actions }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("pcs");
  const [expiry, setExpiry] = useState("");

  function onSubmit(e) {
    e.preventDefault();

    if (!name.trim()) return alert("Please enter an item name.");
    if (!expiry) return alert("Please select an expiry date.");
    if (Number.isNaN(Number(quantity)) || Number(quantity) <= 0) {
      return alert("Quantity must be a positive number.");
    }

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
    const rows = inventory.map((item) => ({
      item,
      status: getExpiryStatus(item.expiry),
    }));

    return rows.sort((a, b) => {
      const r = statusRank(a.status.tone) - statusRank(b.status.tone);
      if (r !== 0) return r;
      return String(a.item.expiry).localeCompare(String(b.item.expiry));
    });
  }, [inventory]);

  const counts = useMemo(() => {
    let danger = 0,
      warn = 0,
      ok = 0;

    for (const i of inventory) {
      const s = getExpiryStatus(i.expiry);
      if (s.tone === "danger") danger++;
      else if (s.tone === "warning") warn++;
      else ok++;
    }

    return { danger, warn, ok };
  }, [inventory]);

  return (
    <div>
      <h2 style={{ margin: "8px 0 6px", fontSize: 32 }}>Inventory</h2>
      <p style={{ marginTop: 0, color: "#4B5563" }}>
        Add items and view expiry-risk status. Updates reflect on Dashboard.
      </p>

      <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
        {/* SECTION 1: Add item */}
        <Section title="Add item" subtitle="Keep stock updated to reduce waste.">
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
            <Field label="Item name">
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Milk"
              />
            </Field>

            <div className="inv-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
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
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="pcs / L / kg"
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

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-primary" type="submit">
                Add item
              </button>

              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => {
                  setName("");
                  setQuantity(1);
                  setUnit("pcs");
                  setExpiry("");
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </Section>

        {/* SECTION 2: Summary */}
        <Section
          title="Inventory summary"
          subtitle="Quick overview of what needs attention."
        >
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Badge tone="danger">Overdue: {counts.danger}</Badge>
            <Badge tone="warning">Expiring soon: {counts.warn}</Badge>
            <Badge tone="ok">OK: {counts.ok}</Badge>
          </div>
        </Section>

        {/* SECTION 3: Items list */}
        <Section
          title="Current items"
          subtitle="Sorted by risk (overdue first). Use Remove to log an outcome."
        >
          {sorted.length === 0 ? (
            <div style={{ color: "#6B7280" }}>No items yet. Add your first ingredient above.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {sorted.map(({ item, status }) => {
                const label =
                  status.tone === "ok" ? "OK" : `${status.label} (${status.days}d)`;

                return (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 14,
                      padding: 14,
                      background: "#FFFFFF",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 900, fontSize: 16, color: "#111827" }}>
                          {item.name}
                        </div>

                        <div
                          style={{
                            marginTop: 8,
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                            color: "#4B5563",
                            fontSize: 14,
                          }}
                        >
                          <div>
                            <strong>{item.quantity}</strong> {item.unit}
                          </div>
                          <div>•</div>
                          <div>
                            <strong>Expiry:</strong> {item.expiry}
                          </div>
                        </div>

                        <div style={{ marginTop: 10 }}>
                          <Badge tone={status.tone}>{label}</Badge>
                        </div>
                      </div>

                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={() => actions.requestRemove(item)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .inv-grid-3 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
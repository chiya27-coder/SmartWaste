import { getExpiryStatus, urgencyScore, suggestedAction } from "../utils/risk.js";

function Card({ title, value, note }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "1rem",
        minWidth: "200px",
      }}
    >
      <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: "2rem", fontWeight: 700, marginTop: "0.25rem" }}>
        {value}
      </div>
      {note ? (
        <div style={{ marginTop: "0.25rem", opacity: 0.8 }}>{note}</div>
      ) : null}
    </div>
  );
}

export default function Dashboard({ inventory }) {
  const statuses = inventory.map((i) => getExpiryStatus(i.expiry));
  const overdue = statuses.filter((s) => s.tone === "danger").length;
  const expiringSoon = statuses.filter((s) => s.tone === "warning").length;

  const urgentItems = [...inventory]
    .sort((a, b) => urgencyScore(b.expiry) - urgencyScore(a.expiry))
    .slice(0, 3);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Snapshot of inventory expiry risk (mock data).</p>

      {/* Summary cards */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginTop: "1rem",
        }}
      >
        <Card title="Total items" value={inventory.length} />
        <Card title="Expiring soon" value={expiringSoon} note="Due within 2 days" />
        <Card title="Overdue" value={overdue} note="Already expired" />
      </div>

      {/* Top urgent items */}
      <div
        style={{
          marginTop: "1.5rem",
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "1rem",
          maxWidth: "700px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Top urgent items</h3>
        <p style={{ marginTop: "0.25rem", opacity: 0.8 }}>
          Items needing attention first (sorted by expiry risk).
        </p>

        <ul style={{ marginTop: "1rem", paddingLeft: "1.25rem" }}>
          {urgentItems.map((item) => {
            const status = getExpiryStatus(item.expiry);

            const text =
              status.tone === "danger"
                ? `Overdue (${status.days}d)`
                : status.tone === "warning"
                ? `Expiring soon (${status.days}d)`
                : "OK";

            return (
              <li key={item.id} style={{ marginBottom: "0.75rem" }}>
                <strong>{item.name}</strong> — {text} — exp: {item.expiry}
                <div
                  style={{
                    fontSize: "0.9rem",
                    opacity: 0.85,
                    marginTop: "0.15rem",
                  }}
                >
                  Suggested action:{" "}
                  <em>{suggestedAction(item.expiry)}</em>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

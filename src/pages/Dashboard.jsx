import { useMemo } from "react";
import { getExpiryStatus } from "../utils/risk.js";

function StatCard({ title, value, note }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#4B5563" }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 34, fontWeight: 900, color: "#111827" }}>{value}</div>
      {note ? <div style={{ marginTop: 6, fontSize: 14, color: "#6B7280" }}>{note}</div> : null}
    </div>
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

function actionText(tone) {
  if (tone === "danger") return "Action: Log as waste or remove from sale. Check storage and reorder if needed.";
  if (tone === "warning") return "Action: Use today, prep specials, apply discount, or freeze if suitable.";
  return "Action: No immediate action needed.";
}

function toneRank(tone) {
  return tone === "danger" ? 0 : tone === "warning" ? 1 : 2;
}

export default function Dashboard({ inventory, wasteLog = [] }) {
  const { overdue, expiringSoon, okCount, urgentTop, savedCount, wastedCount } = useMemo(() => {
    const statuses = inventory.map((i) => ({
      item: i,
      status: getExpiryStatus(i.expiry),
    }));

    const overdue = statuses.filter((x) => x.status.tone === "danger").length;
    const expiringSoon = statuses.filter((x) => x.status.tone === "warning").length;
    const okCount = statuses.filter((x) => x.status.tone === "ok").length;

    const urgentTop = [...statuses]
      .sort((a, b) => {
        const r = toneRank(a.status.tone) - toneRank(b.status.tone);
        if (r !== 0) return r;
        return String(a.item.expiry).localeCompare(String(b.item.expiry));
      })
      .slice(0, 4);

    const wastedCount = wasteLog.filter((x) => x.outcome === "wasted").length;
    const savedCount = wasteLog.length - wastedCount;

    return { overdue, expiringSoon, okCount, urgentTop, savedCount, wastedCount };
  }, [inventory, wasteLog]);

  return (
    <div>
      <h2 style={{ margin: "8px 0 6px", fontSize: 32 }}>Dashboard</h2>
      <p style={{ marginTop: 0, color: "#4B5563" }}>
        Snapshot of expiry risk plus outcome logging (saved vs wasted).
      </p>

      {/* OVERVIEW */}
      <div className="section" style={{ marginTop: 14 }}>
        <div className="section-header">
          <div style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>Overview</div>
          <div style={{ marginTop: 4, fontSize: 14, color: "#6B7280" }}>
            Current inventory status grouped by expiry risk.
          </div>
        </div>

        <div className="section-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <StatCard title="Total items" value={inventory.length} note="Tracked stock lines" />
            <StatCard title="Expiring soon" value={expiringSoon} note="Due within 2 days" />
            <StatCard title="Overdue" value={overdue} note="Already expired" />
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            <StatCard title="OK items" value={okCount} note="Low risk items" />
            <StatCard title="Logged outcomes" value={wasteLog.length} note="Saved + wasted combined" />
          </div>
        </div>
      </div>

      {/* OUTCOMES */}
      <div className="section" style={{ marginTop: 14 }}>
        <div className="section-header">
          <div style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>Outcomes</div>
          <div style={{ marginTop: 4, fontSize: 14, color: "#6B7280" }}>
            What happened to items you removed (saved vs wasted).
          </div>
        </div>

        <div className="section-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            <StatCard title="Saved actions logged" value={savedCount} note="Sold / Used / Donated" />
            <StatCard title="Wasted actions logged" value={wastedCount} note="Discarded items" />
          </div>
        </div>
      </div>

      {/* URGENT LIST */}
      <div className="section" style={{ marginTop: 14 }}>
        <div className="section-header">
          <div style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>Top urgent items</div>
          <div style={{ marginTop: 4, fontSize: 14, color: "#6B7280" }}>
            Sorted by expiry risk to support faster decisions.
          </div>
        </div>

        {urgentTop.length === 0 ? (
          <div className="section-body" style={{ color: "#6B7280" }}>
            No inventory yet. Add items in Inventory to populate the dashboard.
          </div>
        ) : (
          <div>
            {urgentTop.map(({ item, status }, idx) => {
              const label = status.tone === "ok" ? "OK" : `${status.label} (${status.days}d)`;

              return (
                <div
                  key={item.id}
                  style={{
                    padding: 16,
                    borderTop: idx === 0 ? "none" : "1px solid #E5E7EB",
                    display: "grid",
                    gap: 10,
                    background: "white",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontWeight: 900, fontSize: 16, color: "#111827" }}>{item.name}</div>
                    <Badge tone={status.tone}>{label}</Badge>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", color: "#4B5563", fontSize: 14 }}>
                    <div>
                      <strong>{item.quantity}</strong> {item.unit}
                    </div>
                    <div>•</div>
                    <div>
                      <strong>Expiry:</strong> {item.expiry}
                    </div>
                  </div>

                  <div style={{ fontSize: 14, color: "#374151" }}>{actionText(status.tone)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* mobile grid tweaks */}
      <style>{`
        @media (max-width: 720px) {
          .section .section-body > div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
          .section .section-body > div[style*="grid-template-columns: repeat(2"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
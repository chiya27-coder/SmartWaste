import { useMemo } from "react";
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

function StatCard({ title, value, note }) {
  return (
    <div
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: 14,
        padding: 16,
        background: "#FFFFFF",
      }}
    >
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
    gap: 8,
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
  const { overdue, expiringSoon, urgentTop, savedCount, wastedCount } = useMemo(() => {
    const statuses = inventory.map((i) => ({
      item: i,
      status: getExpiryStatus(i.expiry),
    }));

    const overdue = statuses.filter((x) => x.status.tone === "danger").length;
    const expiringSoon = statuses.filter((x) => x.status.tone === "warning").length;

    const urgentTop = [...statuses]
      .sort((a, b) => {
        const r = toneRank(a.status.tone) - toneRank(b.status.tone);
        if (r !== 0) return r;
        return String(a.item.expiry).localeCompare(String(b.item.expiry));
      })
      .slice(0, 4);

    const wastedCount = wasteLog.filter((x) => x.outcome === "wasted").length;
    const savedCount = wasteLog.length - wastedCount;

    return { overdue, expiringSoon, urgentTop, savedCount, wastedCount };
  }, [inventory, wasteLog]);

  return (
    <div>
      <h2 style={{ margin: "8px 0 6px", fontSize: 32 }}>Dashboard</h2>
      <p style={{ marginTop: 0, color: "#4B5563" }}>
        Snapshot of expiry risk plus outcome logging (saved vs wasted).
      </p>

      {/* Page layout grid (creates clear spacing) */}
      <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
        {/* SECTION 1: Inventory overview */}
        <Section
          title="Inventory overview"
          subtitle="High-level status to prioritise today’s actions."
        >
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            }}
          >
            <StatCard title="Total items" value={inventory.length} note="Tracked stock lines" />
            <StatCard title="Expiring soon" value={expiringSoon} note="Due within 2 days" />
            <StatCard title="Overdue" value={overdue} note="Already expired" />
          </div>
        </Section>

        {/* SECTION 2: Waste outcomes */}
        <Section
          title="Outcome logging"
          subtitle="Tracks whether items were saved (sold/used/donated) or wasted."
        >
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            }}
          >
            <StatCard title="Saved actions logged" value={savedCount} note="Sold / Used / Donated" />
            <StatCard title="Wasted actions logged" value={wastedCount} note="Discarded items" />
          </div>
        </Section>

        {/* SECTION 3: Urgent list */}
        <Section
          title="Top urgent items"
          subtitle="Sorted by expiry risk to support faster decisions."
        >
          {urgentTop.length === 0 ? (
            <div style={{ color: "#6B7280" }}>
              No inventory yet. Add items in Inventory to populate the dashboard.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {urgentTop.map(({ item, status }) => {
                const label = status.tone === "ok" ? "OK" : `${status.label} (${status.days}d)`;

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
                      <div style={{ fontWeight: 900, fontSize: 16 }}>{item.name}</div>
                      <Badge tone={status.tone}>{label}</Badge>
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

                    <div style={{ marginTop: 8, fontSize: 14, color: "#374151" }}>
                      {actionText(status.tone)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      {/* Mobile stacking */}
      <style>{`
        @media (max-width: 760px) {
          .dashboard-3col { grid-template-columns: 1fr !important; }
          .dashboard-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
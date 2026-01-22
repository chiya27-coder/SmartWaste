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
  
  function outcomeMeta(outcome) {
    // outcomes you used: "sold_used" | "donated" | "wasted"
    if (outcome === "wasted") return { label: "Wasted", tone: "danger" };
    if (outcome === "donated") return { label: "Donated", tone: "ok" };
    return { label: "Sold / Used", tone: "ok" };
  }
  
  function Section({ title, subtitle, children }) {
    return (
      <div
        className="card"
        style={{
          overflow: "hidden",
          borderRadius: 16,
          border: "1px solid #E5E7EB",
          background: "white",
        }}
      >
        <div style={{ padding: 16, borderBottom: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#111827" }}>{title}</div>
          {subtitle ? (
            <div style={{ marginTop: 4, fontSize: 14, color: "#6B7280" }}>{subtitle}</div>
          ) : null}
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    );
  }
  
  function StatCard({ title, value, note }) {
    return (
      <div
        className="card"
        style={{
          padding: 16,
          borderRadius: 16,
          border: "1px solid #E5E7EB",
          background: "white",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: "#4B5563" }}>{title}</div>
        <div style={{ marginTop: 6, fontSize: 34, fontWeight: 900, color: "#111827" }}>{value}</div>
        {note ? <div style={{ marginTop: 6, fontSize: 14, color: "#6B7280" }}>{note}</div> : null}
      </div>
    );
  }
  
  export default function Logs({ wasteLog = [] }) {
    const total = wasteLog.length;
    const wasted = wasteLog.filter((x) => x.outcome === "wasted").length;
    const saved = total - wasted;
  
    const sorted = [...wasteLog].sort((a, b) => String(b.atISO).localeCompare(String(a.atISO)));
  
    return (
      <div className="container" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 style={{ margin: "8px 0 6px", fontSize: 32 }}>Logs</h2>
        <p style={{ marginTop: 0, color: "#4B5563" }}>
          Records of items removed and what happened to them (saved vs wasted).
        </p>
  
        {/* Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 12,
            marginTop: 14,
          }}
        >
          <StatCard title="Total logs" value={total} note="All recorded removals" />
          <StatCard title="Saved" value={saved} note="Sold / used / donated" />
          <StatCard title="Wasted" value={wasted} note="Discarded items" />
        </div>
  
        {/* Entries */}
        <div style={{ marginTop: 14 }}>
          <Section
            title="Log entries"
            subtitle="Most recent first. Use this to review patterns and improve stock decisions."
          >
            {sorted.length === 0 ? (
              <div style={{ color: "#6B7280" }}>No logs yet. Remove an item to create a log entry.</div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {sorted.map((e) => {
                  const meta = outcomeMeta(e.outcome);
                  const when = e.atISO ? new Date(e.atISO).toLocaleString() : "-";
  
                  return (
                    <div
                      key={e.id}
                      style={{
                        border: "1px solid #E5E7EB",
                        borderRadius: 14,
                        padding: 14,
                        background: "#FFFFFF",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 900, fontSize: 16, color: "#111827" }}>{e.name}</div>
                          <div style={{ marginTop: 6, fontSize: 14, color: "#4B5563", display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <div>
                              <strong>{e.quantity}</strong> {e.unit}
                            </div>
                            <div>•</div>
                            <div>
                              <strong>Expiry:</strong> {e.expiry}
                            </div>
                            <div>•</div>
                            <div>
                              <strong>Logged:</strong> {when}
                            </div>
                          </div>
                        </div>
  
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </div>
  
                      {e.notes ? (
                        <div style={{ marginTop: 10, fontSize: 14, color: "#374151" }}>
                          <strong>Notes:</strong> {e.notes}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </div>
  
        <style>{`
          @media (max-width: 700px) {
            .container > div[style*="grid-template-columns: repeat(3"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    );
  }
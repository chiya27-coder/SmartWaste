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
  
  function OutcomeBadge({ outcome }) {
    const styles = {
      sold_used: { bg: "#DCFCE7", border: "#86EFAC", text: "#166534", label: "Saved" },
      donated: { bg: "#E0F2FE", border: "#7DD3FC", text: "#075985", label: "Donated" },
      wasted: { bg: "#FEE2E2", border: "#FCA5A5", text: "#991B1B", label: "Wasted" },
    }[outcome];
  
    return (
      <span
        style={{
          padding: "6px 10px",
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 800,
          border: `1px solid ${styles.border}`,
          background: styles.bg,
          color: styles.text,
          whiteSpace: "nowrap",
        }}
      >
        {styles.label}
      </span>
    );
  }
  
  export default function Logs({ wasteLog }) {
    return (
      <div>
        <h2 style={{ margin: "8px 0 6px", fontSize: 32 }}>Logs</h2>
        <p style={{ marginTop: 0, color: "#4B5563" }}>
          Records of items removed and what happened to them.
        </p>
  
        <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
          <Section
            title="Action history"
            subtitle="Every removal is logged for accountability and reporting."
          >
            {wasteLog.length === 0 ? (
              <div style={{ color: "#6B7280" }}>
                No logs yet. Remove items from Inventory to create entries.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {wasteLog.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 14,
                      padding: 14,
                      background: "#FFFFFF",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 900, fontSize: 16, color: "#111827" }}>
                          {e.name}
                        </div>
  
                        <div
                          style={{
                            marginTop: 6,
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                            fontSize: 14,
                            color: "#4B5563",
                          }}
                        >
                          <div>
                            <strong>{e.quantity}</strong> {e.unit}
                          </div>
                          <div>•</div>
                          <div>
                            <strong>Expiry:</strong> {e.expiry}
                          </div>
                        </div>
  
                        {e.notes ? (
                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 14,
                              color: "#374151",
                            }}
                          >
                            <strong>Notes:</strong> {e.notes}
                          </div>
                        ) : null}
  
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                            color: "#6B7280",
                          }}
                        >
                          Logged on {new Date(e.atISO).toLocaleString()}
                        </div>
                      </div>
  
                      <OutcomeBadge outcome={e.outcome} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    );
  }
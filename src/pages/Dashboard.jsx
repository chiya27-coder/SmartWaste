import { useMemo } from "react";
import { getExpiryStatus } from "../utils/risk.js";

function StatCard({ title, value, note }) {
  return (
    <div className="rounded-2xl bg-slate-900/60 p-5 ring-1 ring-white/10">
      <div className="text-sm font-medium text-slate-300">{title}</div>
      <div className="mt-2 text-4xl font-extrabold tracking-tight">{value}</div>
      {note ? <div className="mt-2 text-sm text-slate-300">{note}</div> : null}
    </div>
  );
}

function TonePill({ tone, children }) {
  const cls =
    tone === "danger"
      ? "bg-red-500/15 text-red-200 ring-1 ring-red-500/30"
      : tone === "warning"
      ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30"
      : "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function urgencyRank(tone) {
  return tone === "danger" ? 0 : tone === "warning" ? 1 : 2;
}

function SuggestedAction({ tone }) {
  // Lightweight, but looks “product-like” for a final project
  const text =
    tone === "danger"
      ? "Suggested action: Dispose / log waste, check storage, reorder if needed."
      : tone === "warning"
      ? "Suggested action: Use today, prep specials, apply discount, or freeze."
      : "Suggested action: No action needed.";

  return <div className="mt-2 text-sm text-slate-300">{text}</div>;
}

export default function Dashboard({ inventory }) {
  const { overdue, expiringSoon, okCount, urgentTop } = useMemo(() => {
    const statuses = inventory.map((i) => ({
      item: i,
      status: getExpiryStatus(i.expiry),
    }));

    const overdue = statuses.filter((x) => x.status.tone === "danger").length;
    const expiringSoon = statuses.filter((x) => x.status.tone === "warning").length;
    const okCount = statuses.filter((x) => x.status.tone === "ok").length;

    const urgentTop = [...statuses]
      .sort((a, b) => {
        const r = urgencyRank(a.status.tone) - urgencyRank(b.status.tone);
        if (r !== 0) return r;
        // earlier expiry first
        return String(a.item.expiry).localeCompare(String(b.item.expiry));
      })
      .slice(0, 4);

    return { overdue, expiringSoon, okCount, urgentTop };
  }, [inventory]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="mt-1 text-slate-300">
          Quick view of stock health, expiry risk, and what to action first.
        </p>
      </div>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total items" value={inventory.length} note="All tracked stock lines" />
        <StatCard title="Overdue" value={overdue} note="Already expired" />
        <StatCard title="Expiring soon" value={expiringSoon} note="Due within 2 days" />
        <StatCard title="OK" value={okCount} note="Low risk items" />
      </section>

      {/* Urgent list */}
      <section className="rounded-2xl bg-slate-900/60 ring-1 ring-white/10">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-lg font-semibold">Top urgent items</h3>
          <div className="text-sm text-slate-300">Sorted by risk</div>
        </div>

        <div className="divide-y divide-white/10">
          {urgentTop.map(({ item, status }) => {
            const label =
              status.tone === "ok" ? "OK" : `${status.label} (${status.days}d)`;

            return (
              <div key={item.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-base font-semibold">{item.name}</h4>
                      <TonePill tone={status.tone}>{label}</TonePill>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-slate-300 sm:grid-cols-3">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-400">Quantity</div>
                        <div className="mt-1 text-slate-100">
                          {item.quantity} {item.unit}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-400">Expiry</div>
                        <div className="mt-1 text-slate-100">{item.expiry}</div>
                      </div>
                    </div>

                    <SuggestedAction tone={status.tone} />
                  </div>
                </div>
              </div>
            );
          })}

          {inventory.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-300">
              No inventory yet. Add items in Inventory to populate the dashboard.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
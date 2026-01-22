import { useMemo, useState } from "react";
import { getExpiryStatus } from "../utils/risk.js";

function StatusPill({ tone, label }) {
  const cls =
    tone === "danger"
      ? "bg-red-500/15 text-red-200 ring-1 ring-red-500/30"
      : tone === "warning"
      ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30"
      : "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export default function Inventory({ inventory, actions }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("pcs");
  const [expiry, setExpiry] = useState("");

  const sorted = useMemo(() => {
    // Sort by urgency: overdue first, then expiring soon, then ok; then by expiry date
    const rank = (tone) => (tone === "danger" ? 0 : tone === "warning" ? 1 : 2);

    return [...inventory].sort((a, b) => {
      const sa = getExpiryStatus(a.expiry);
      const sb = getExpiryStatus(b.expiry);
      const r = rank(sa.tone) - rank(sb.tone);
      if (r !== 0) return r;
      return String(a.expiry).localeCompare(String(b.expiry));
    });
  }, [inventory]);

  function onSubmit(e) {
    e.preventDefault();

    if (!name.trim()) return alert("Please enter an item name.");
    if (!expiry) return alert("Please select an expiry date.");

    const q = Number(quantity);
    if (Number.isNaN(q) || q <= 0) return alert("Quantity must be a positive number.");

    actions.addItem({
      name: name.trim(),
      quantity: q,
      unit: unit.trim() || "pcs",
      expiry,
    });

    setName("");
    setQuantity("1");
    setUnit("pcs");
    setExpiry("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
        <p className="mt-1 text-slate-300">
          Add items, track expiry risk, and keep the dashboard up to date.
        </p>
      </div>

      {/* Add Item Card */}
      <section className="rounded-2xl bg-slate-900/60 p-5 ring-1 ring-white/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Add item</h3>
            <p className="mt-1 text-sm text-slate-300">Enter stock details and an expiry date.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Item name">
              <input
                className="w-full rounded-xl bg-slate-950/60 px-4 py-3 text-slate-100 ring-1 ring-white/10 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/25"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Milk, Tomatoes, Chicken breast"
              />
            </Field>
          </div>

          <Field label="Quantity">
            <input
              type="number"
              min="1"
              className="w-full rounded-xl bg-slate-950/60 px-4 py-3 text-slate-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/25"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Field>

          <Field label="Unit">
            <input
              className="w-full rounded-xl bg-slate-950/60 px-4 py-3 text-slate-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/25"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="pcs, L, kg"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Expiry date">
              <input
                type="date"
                className="w-full rounded-xl bg-slate-950/60 px-4 py-3 text-slate-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/25"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </Field>
          </div>

          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-200"
            >
              Add item
            </button>

            <button
              type="button"
              onClick={() => {
                setName("");
                setQuantity("1");
                setUnit("pcs");
                setExpiry("");
              }}
              className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-700"
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {/* Items list */}
      <section className="rounded-2xl bg-slate-900/60 ring-1 ring-white/10">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-lg font-semibold">Items</h3>
          <div className="text-sm text-slate-300">{sorted.length} total</div>
        </div>

        {/* Mobile-first cards */}
        <div className="divide-y divide-white/10">
          {sorted.map((item) => {
            const status = getExpiryStatus(item.expiry);
            const pillText =
              status.tone === "ok" ? "OK" : `${status.label} (${status.days}d)`;

            return (
              <div key={item.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-base font-semibold">{item.name}</h4>
                      <StatusPill tone={status.tone} label={pillText} />
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
                  </div>

                  <button
                    onClick={() => actions.removeItem(item.id)}
                    className="shrink-0 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          {sorted.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-300">
              No items yet. Add your first item above.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
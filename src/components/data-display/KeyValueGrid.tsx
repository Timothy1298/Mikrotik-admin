export function KeyValueGrid({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-mono">{item.label}</p>
          <p className="mt-2 text-sm font-medium text-slate-100">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

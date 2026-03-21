export function KeyValueGrid({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted font-mono">{item.label}</p>
          <p className="mt-2 text-sm font-medium text-text-primary">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

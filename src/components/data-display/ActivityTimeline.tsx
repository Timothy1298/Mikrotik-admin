export function ActivityTimeline({ items }: { items: Array<{ title: string; time: string; description: string }> }) {
  return (
    <div className="surface-card p-5">
      <div className="space-y-5">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="relative pl-7">
            <span className="absolute left-0 top-1 h-3 w-3 rounded-full bg-primary" />
            <span className="absolute left-[5px] top-5 h-full w-px bg-primary/15" />
            <p className="text-sm font-medium text-text-primary">{item.title}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted font-mono">{item.time}</p>
            <p className="mt-2 text-sm text-text-secondary">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

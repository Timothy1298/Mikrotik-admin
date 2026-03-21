export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded-lg border border-background-border bg-background-panel px-2 py-1 font-mono text-xs text-text-primary group-hover:block">
        {label}
      </span>
    </span>
  );
}

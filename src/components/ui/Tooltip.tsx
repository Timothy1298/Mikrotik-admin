export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded-lg border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-2 py-1 text-xs text-slate-100 group-hover:block font-mono">
        {label}
      </span>
    </span>
  );
}

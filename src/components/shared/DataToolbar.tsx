export function DataToolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4 rounded-3xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 md:flex-row md:items-center md:justify-between">{children}</div>;
}

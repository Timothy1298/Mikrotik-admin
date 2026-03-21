export function DataToolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4 rounded-3xl border border-background-border bg-background-panel p-4 md:flex-row md:items-center md:justify-between">{children}</div>;
}

export function SidebarSection({ title, children, collapsed = false }: { title: string; children: React.ReactNode; collapsed?: boolean }) {
  return (
    <section className="space-y-2">
      {!collapsed ? <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 font-mono">{title}</p> : null}
      <div className="space-y-1">{children}</div>
    </section>
  );
}

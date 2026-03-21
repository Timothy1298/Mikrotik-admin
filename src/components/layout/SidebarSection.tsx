export function SidebarSection({
  title,
  children,
  collapsed = false,
}: {
  title: string;
  children: React.ReactNode;
  collapsed?: boolean;
}) {
  return (
    <section className="space-y-2">
      {!collapsed ? (
        <p className="px-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          {title}
        </p>
      ) : null}
      <div className="space-y-1">{children}</div>
    </section>
  );
}

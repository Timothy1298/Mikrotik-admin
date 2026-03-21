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
    <section className="space-y-1.5">
      {!collapsed ? (
        <p className="px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          {title}
        </p>
      ) : null}
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}

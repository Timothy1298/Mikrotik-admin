export function PageSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-3xl border border-background-border bg-background-panel p-5">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {description ? <p className="mt-1 text-sm text-text-secondary">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

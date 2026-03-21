export function DetailItem({ label, value }: { label: string; value: string }) {
  return <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">{label}</p><p className="mt-1 text-sm text-text-primary">{value}</p></div>;
}

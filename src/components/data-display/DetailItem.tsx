export function DetailItem({ label, value }: { label: string; value: string }) {
  return <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p><p className="mt-1 text-sm text-slate-100">{value}</p></div>;
}

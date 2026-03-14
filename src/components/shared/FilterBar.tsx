export function FilterBar({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) {
  return <div className="flex flex-col gap-4 rounded-3xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 md:flex-row md:items-center md:justify-between"> <div className="flex flex-wrap gap-3">{left}</div> {right ? <div className="flex flex-wrap gap-3">{right}</div> : null} </div>;
}

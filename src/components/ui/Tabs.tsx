import { cn } from "@/lib/utils/cn";

export function Tabs({ tabs, value, onChange }: { tabs: Array<{ label: string; value: string }>; value: string; onChange: (value: string) => void }) {
  return (
    <div className="inline-flex rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-1">
      {tabs.map((tab) => (
        <button key={tab.value} type="button" onClick={() => onChange(tab.value)} className={cn("rounded-xl border border-transparent px-4 py-2 text-sm font-medium transition", value === tab.value ? "surface-active text-slate-100" : "text-slate-400 hover:border-brand-500/15 hover:bg-[rgba(37,99,235,0.08)] hover:text-white")}>{tab.label}</button>
      ))}
    </div>
  );
}

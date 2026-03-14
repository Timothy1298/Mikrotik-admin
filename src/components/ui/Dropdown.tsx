import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export function Dropdown({ items }: { items: Array<{ label: string; onClick?: () => void; danger?: boolean }> }) {
  return (
    <div className="group relative inline-block text-left" onClick={(event) => event.stopPropagation()}>
      <Button variant="ghost" size="icon" onClick={(event) => event.stopPropagation()}>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      <div className="absolute right-0 z-20 mt-2 hidden min-w-44 rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.96)] p-2 shadow-[0_20px_45px_rgba(2,6,23,0.45)] group-focus-within:block group-hover:block">
        {items.map((item) => (
          <button key={item.label} type="button" onClick={(event) => { event.stopPropagation(); item.onClick?.(); }} className={cn("flex w-full rounded-xl border border-transparent px-3 py-2 text-left text-sm transition hover:border-brand-500/15 hover:bg-[rgba(37,99,235,0.08)]", item.danger ? "text-danger" : "text-slate-200")}>{item.label}</button>
        ))}
      </div>
    </div>
  );
}

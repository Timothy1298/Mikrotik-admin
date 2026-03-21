import { cn } from "@/lib/utils/cn";

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-background-border bg-background-panel p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            "rounded-lg border border-transparent px-4 py-2 text-sm font-medium transition-colors",
            value === tab.value
              ? "surface-active text-text-primary"
              : "text-text-secondary hover:border-primary/20 hover:bg-primary/10 hover:text-text-primary",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

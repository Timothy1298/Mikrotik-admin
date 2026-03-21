import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export function Dropdown({
  items,
}: {
  items: Array<{ label: string; onClick?: () => void; danger?: boolean }>;
}) {
  return (
    <div className="group relative inline-block text-left" onClick={(event) => event.stopPropagation()}>
      <Button variant="ghost" size="icon" onClick={(event) => event.stopPropagation()}>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      <div className="absolute right-0 z-20 mt-2 hidden min-w-44 rounded-xl border border-background-border bg-background-panel p-2 shadow-panel group-focus-within:block group-hover:block">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              item.onClick?.();
            }}
            className={cn(
              "flex w-full rounded-lg border border-transparent px-3 py-2 text-left text-sm transition-colors hover:border-primary/20 hover:bg-primary/10",
              item.danger ? "text-danger" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

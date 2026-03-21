import { NavLink } from "react-router-dom";
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
  const normalizePath = (path: string) => {
    if (!path) return "/";
    return path.length > 1 ? path.replace(/\/+$/, "") : path;
  };

  const currentPath = normalizePath(value);
  const activeTabValue = tabs
    .slice()
    .sort((a, b) => b.value.length - a.value.length)
    .find((tab) => {
      const tabPath = normalizePath(tab.value);
      return currentPath === tabPath || currentPath.startsWith(`${tabPath}/`);
    })?.value;

  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-background-border bg-background-panel p-1">
      {tabs.map((tab) => {
        const className = cn(
          "rounded-lg border border-transparent px-4 py-2 text-sm font-medium transition-colors",
          activeTabValue === tab.value
            ? "surface-active text-text-primary"
            : "text-text-secondary hover:border-primary/20 hover:bg-primary/10 hover:text-text-primary",
        );

        if (tab.value.startsWith("/")) {
          return (
            <NavLink key={tab.value} to={tab.value} className={className}>
              {tab.label}
            </NavLink>
          );
        }

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={className}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

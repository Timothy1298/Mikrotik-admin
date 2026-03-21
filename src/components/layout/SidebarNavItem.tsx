import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils/cn";

export function SidebarNavItem({
  icon: Icon,
  label,
  to,
  collapsed,
  badge,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  to: string;
  collapsed?: boolean;
  badge?: string | number;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-between rounded-xl border px-3 py-2 text-xs transition-colors",
          (active ?? isActive)
            ? "surface-active text-text-primary"
            : "border-transparent text-text-secondary hover:border-primary/20 hover:bg-primary/10 hover:text-text-primary",
          collapsed && "justify-center",
        )
      }
    >
      <span className="flex min-w-0 items-center gap-3">
        <Icon className="h-4 w-4" />
        {!collapsed ? <span className="leading-tight">{label}</span> : null}
      </span>
      {!collapsed && badge ? (
        <span className="rounded-full border border-background-border bg-background-elevated px-2 py-0.5 text-xs font-mono text-text-secondary">
          {badge}
        </span>
      ) : null}
    </NavLink>
  );

  return collapsed ? <Tooltip label={label}>{content}</Tooltip> : content;
}

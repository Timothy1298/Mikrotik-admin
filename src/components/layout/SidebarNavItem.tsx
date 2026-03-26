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
          "flex items-center justify-between rounded-xl border px-3 py-2.5 text-[15px] font-semibold transition-colors",
          (active ?? isActive)
            ? "surface-active text-text-primary"
            : "border-transparent text-text-primary/90 hover:border-primary/20 hover:bg-primary/10 hover:text-text-primary",
          collapsed && "justify-center",
        )
      }
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <Icon className="h-[15px] w-[15px]" />
        {!collapsed ? <span className="truncate leading-snug">{label}</span> : null}
      </span>
      {!collapsed && badge ? (
        <span className="rounded-full border border-background-border bg-background-elevated px-2 py-0.5 text-xs font-mono text-text-primary/85">
          {badge}
        </span>
      ) : null}
    </NavLink>
  );

  return collapsed ? <Tooltip label={label}>{content}</Tooltip> : content;
}

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
          "flex items-center justify-between rounded-2xl border px-3 py-3 text-sm transition",
          (active ?? isActive) ? "surface-active border-brand-500/35 text-slate-100" : "border-transparent text-slate-300 hover:border-brand-500/15 hover:bg-[rgba(37,99,235,0.08)] hover:text-white",
          collapsed && "justify-center",
        )
      }
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        {!collapsed ? <span>{label}</span> : null}
      </span>
      {!collapsed && badge ? <span className="rounded-full border border-brand-500/15 bg-[linear-gradient(90deg,rgba(37,99,235,0.12),rgba(56,189,248,0.05))] px-2 py-0.5 text-xs font-mono text-slate-200">{badge}</span> : null}
    </NavLink>
  );

  return collapsed ? <Tooltip label={label}>{content}</Tooltip> : content;
}

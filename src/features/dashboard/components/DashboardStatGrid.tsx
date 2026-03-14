import { Activity, CreditCard, Router, Shield } from "lucide-react";
import type { DashboardSummaryMetric } from "@/features/dashboard/types/dashboard.types";
import { StatCard } from "@/components/shared/StatCard";

const iconMap = [Router, Shield, Activity, CreditCard] as const;

export function DashboardStatGrid({ items }: { items: DashboardSummaryMetric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <StatCard
          key={item.title}
          title={item.title}
          value={item.value}
          description={item.description}
          icon={iconMap[index] ?? Activity}
          tone={item.tone}
          delta={item.delta}
        />
      ))}
    </div>
  );
}

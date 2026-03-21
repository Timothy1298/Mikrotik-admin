import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

const toneStyles = {
  info: "icon-block-primary",
  success: "icon-block-primary",
  warning: "border border-[rgba(139,92,246,0.25)] bg-primary/10 text-primary",
  danger: "border border-danger/30 bg-danger/10 text-danger",
  neutral: "border border-background-border bg-primary/10 text-text-primary",
} as const;

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "info",
  delta,
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: keyof typeof toneStyles;
  delta?: string;
}) {
  return (
    <Card className="surface-card-3d animate-fade-up overflow-hidden p-0">
      <div className="h-full rounded-2xl border border-background-border bg-background-elevated p-3.5">
        <CardHeader className="mb-2.5 items-start gap-2.5">
          <div>
            <CardDescription className="text-[0.88rem]">{title}</CardDescription>
            <CardTitle className="mt-1.5 text-[1.4rem] md:text-[1.5rem]">{value}</CardTitle>
          </div>
          <div className={cn("rounded-2xl p-1.5", toneStyles[tone])}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        </CardHeader>
        <p className="text-[0.85rem] leading-5 text-text-secondary">{description}</p>
        {delta ? (
          <div className="mt-2.5 flex items-center gap-2">
            <Badge tone={tone === "neutral" ? "info" : tone} className="gap-1 rounded-xl px-2 py-1 normal-case tracking-normal">
              <TrendingUp className="h-3.5 w-3.5" />
              {delta}
            </Badge>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

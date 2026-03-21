import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export function AnalyticsChartCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="surface-card-3d overflow-hidden p-0">
      <div className="rounded-2xl border border-background-border bg-background-elevated p-4 md:p-5">
        <CardHeader className="mb-5 items-start gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </CardHeader>
        <div className="h-64 md:h-72">{children}</div>
      </div>
    </Card>
  );
}

import { Badge } from "@/components/ui/Badge";

export function TicketStatusBadge({ status }: { status: string }) {
  const tone = status === "resolved" ? "success" : status === "closed" ? "neutral" : status === "in_progress" ? "info" : "warning";
  return <Badge tone={tone as "success" | "neutral" | "info" | "warning"}>{status.replace(/_/g, " ")}</Badge>;
}

export function TicketPriorityBadge({ priority }: { priority: string }) {
  const tone = priority === "urgent" ? "danger" : priority === "high" ? "warning" : priority === "medium" ? "info" : "neutral";
  return <Badge tone={tone as "danger" | "warning" | "info" | "neutral"}>{priority}</Badge>;
}

export function TicketCategoryBadge({ category }: { category: string }) {
  const tone = category === "billing" ? "warning" : category === "technical" || category === "bug_report" ? "info" : "neutral";
  return <Badge tone={tone as "warning" | "info" | "neutral"}>{category.replace(/_/g, " ")}</Badge>;
}

export function TicketEscalationBadge({ escalated }: { escalated: boolean }) {
  return <Badge tone={escalated ? "danger" : "neutral"}>{escalated ? "Escalated" : "Normal"}</Badge>;
}

export function SLABadge({ breached, remaining }: { breached: boolean; remaining: number | null }) {
  if (breached) return <Badge tone="danger">SLA Breached</Badge>;
  if (remaining !== null && remaining < 4) return <Badge tone="warning">SLA {remaining.toFixed(1)}h left</Badge>;
  return <Badge tone="neutral">SLA OK</Badge>;
}

export function TicketAgeBadge({ stale }: { stale: boolean }) {
  return stale ? <Badge tone="warning">Stale</Badge> : null;
}

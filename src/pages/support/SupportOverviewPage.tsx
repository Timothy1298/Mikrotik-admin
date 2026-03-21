import { ArrowRight, Clock3, LifeBuoy, Plus, ShieldAlert, UserCog } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { TableLoader } from "@/components/feedback/TableLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { supportTabs } from "@/config/module-tabs";
import { appRoutes } from "@/config/routes";
import { CreateTicketDialog, TicketsTable } from "@/features/support/components";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useAssigneeWorkload, useEscalatedQueue, useStaleQueue, useSupportOverview, useTickets } from "@/features/support/hooks/useSupport";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { formatDateTime } from "@/lib/formatters/date";
import { can } from "@/lib/permissions/can";
import { permissions } from "@/lib/permissions/permissions";

export function SupportOverviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser(true);
  const addDisclosure = useDisclosure(false);
  const overviewQuery = useSupportOverview();
  const urgentQuery = useTickets({ limit: 5, priority: "urgent", sortBy: "updatedAt", sortOrder: "desc" });
  const staleQuery = useStaleQueue({ limit: 5 });
  const escalatedQuery = useEscalatedQueue({ limit: 5 });
  const workloadQuery = useAssigneeWorkload();

  if (overviewQuery.isPending) return <TableLoader />;
  if (overviewQuery.isError || !overviewQuery.data) return <ErrorState title="Unable to load support overview" description="Retry after confirming the admin support API is available." onAction={() => void overviewQuery.refetch()} />;

  const overview = overviewQuery.data;

  return (
    <section className="space-y-6">
      <PageHeader title="Support & Tickets" description="Support operations command center for triage, ownership, escalation, queue aging, and customer-impact context." meta={overview.lastSupportSyncAt ? `Last sync ${formatDateTime(overview.lastSupportSyncAt)}` : "Support telemetry ready"} />
      <Tabs tabs={[...supportTabs]} value={location.pathname} onChange={navigate} />
      <div className="flex flex-wrap justify-end gap-3">
        {can(currentUser, permissions.supportManage) ? (
          <Button variant="outline" leftIcon={<Plus className="h-4 w-4" />} onClick={addDisclosure.onOpen}>
            New Ticket
          </Button>
        ) : null}
        <RefreshButton loading={overviewQuery.isFetching || urgentQuery.isFetching || staleQuery.isFetching || escalatedQuery.isFetching || workloadQuery.isFetching} onClick={() => { void overviewQuery.refetch(); void urgentQuery.refetch(); void staleQuery.refetch(); void escalatedQuery.refetch(); void workloadQuery.refetch(); }} />
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Primary actions</CardTitle>
            <CardDescription>Most-used support actions, promoted for faster queue handling and ticket creation.</CardDescription>
          </div>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          {can(currentUser, permissions.supportManage) ? <Button leftIcon={<Plus className="h-4 w-4" />} onClick={addDisclosure.onOpen}>New Ticket</Button> : null}
          <Button variant="outline" onClick={() => navigate(appRoutes.supportTickets)}>Open All Tickets</Button>
          <Button variant="outline" onClick={() => navigate(appRoutes.supportUnassigned)}>Unassigned Queue</Button>
          <Button variant="outline" onClick={() => navigate(appRoutes.supportEscalated)}>Escalated Queue</Button>
          <Button variant="outline" onClick={() => navigate(appRoutes.supportStale)}>Stale Tickets</Button>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Open tickets" value={String(overview.openTickets)} progress={Math.min(100, overview.openTickets)} />
        <MetricCard title="Escalated" value={String(overview.escalatedTickets)} progress={Math.min(100, overview.escalatedTickets * 8)} />
        <MetricCard title="Unassigned" value={String(overview.unassignedTickets)} progress={Math.min(100, overview.unassignedTickets * 8)} />
        <MetricCard title="Stale / aging" value={String(overview.staleTickets)} progress={Math.min(100, overview.staleTickets * 8)} />
        <MetricCard title="High priority" value={String(overview.highPriorityTickets)} progress={Math.min(100, overview.highPriorityTickets * 10)} />
        <MetricCard title="Awaiting admin" value={String(overview.ticketsAwaitingAdminReply)} progress={Math.min(100, overview.ticketsAwaitingAdminReply * 8)} />
        <MetricCard title="Awaiting customer" value={String(overview.ticketsAwaitingCustomerReply)} progress={Math.min(100, overview.ticketsAwaitingCustomerReply * 8)} />
        <MetricCard title="VIP impact" value={String(overview.vipCustomerTickets)} progress={Math.min(100, overview.vipCustomerTickets * 12)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader><div><CardTitle>Queue summary</CardTitle><CardDescription>Core support backlog signals from the real admin support overview.</CardDescription></div></CardHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">Resolved: {overview.resolvedTickets}</div>
            <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">Closed: {overview.closedTickets}</div>
            <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">Linked incidents: {overview.ticketsLinkedToIncidents}</div>
            <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">Billing-linked: {overview.ticketsLinkedToBillingIssues}</div>
            <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">Router-linked: {overview.ticketsLinkedToRouterIssues}</div>
            <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">SLA breached: {overview.slaBreachedTickets}</div>
          </div>
        </Card>
        <Card>
          <CardHeader><div><CardTitle>Quick jumps</CardTitle><CardDescription>Open the highest-signal support queues directly from overview.</CardDescription></div></CardHeader>
          <div className="grid gap-3">
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-background-border bg-background-panel px-4 text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary" to={appRoutes.supportTickets}>All Tickets <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-background-border bg-background-panel px-4 text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary" to={appRoutes.supportUnassigned}>Unassigned Queue <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-background-border bg-background-panel px-4 text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary" to={appRoutes.supportEscalated}>Escalated <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-background-border bg-background-panel px-4 text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary" to={appRoutes.supportStale}>Stale / Aging <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader><div><CardTitle>Recent urgent tickets</CardTitle><CardDescription>Urgent tickets needing immediate support operator attention.</CardDescription></div></CardHeader>
          {urgentQuery.isPending ? <SectionLoader /> : urgentQuery.isError ? <ErrorState title="Unable to load urgent tickets" description="Retry after confirming the support ticket directory endpoint is available." onAction={() => void urgentQuery.refetch()} /> : (urgentQuery.data?.items || []).length ? <TicketsTable rows={urgentQuery.data?.items || []} onOpen={() => undefined} /> : <EmptyState icon={ShieldAlert} title="No urgent tickets" description="There are no urgent tickets in the current queue." />}
        </Card>
        <Card>
          <CardHeader><div><CardTitle>Assignee workload</CardTitle><CardDescription>Current open ticket burden by support operator.</CardDescription></div></CardHeader>
          <div className="space-y-3">
            {workloadQuery.isPending ? <SectionLoader /> : workloadQuery.isError ? <ErrorState title="Unable to load support workload" description="Retry after confirming the assignee workload endpoint is available." onAction={() => void workloadQuery.refetch()} /> : (workloadQuery.data || []).length ? workloadQuery.data?.slice(0, 6).map((item) => (
              <div key={item.assignee?.id || "unassigned"} className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="font-medium text-text-primary">{item.assignee?.name || "Unassigned"}</p>
                <p className="mt-1 text-sm text-text-secondary">{item.openTickets} open · {item.escalatedTickets} escalated · {item.staleTickets} stale</p>
              </div>
            )) : <EmptyState icon={UserCog} title="No workload data" description="No assignee workload is currently available." />}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader><div><CardTitle>Stale tickets</CardTitle><CardDescription>Support tickets that have gone idle and need follow-up.</CardDescription></div></CardHeader>
          <div className="space-y-3">
            {staleQuery.isPending ? <SectionLoader /> : staleQuery.isError ? <ErrorState title="Unable to load stale tickets" description="Retry after confirming the stale queue endpoint is available." onAction={() => void staleQuery.refetch()} /> : (staleQuery.data?.items || []).length ? staleQuery.data?.items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="font-medium text-text-primary">{item.subject}</p>
                <p className="mt-1 text-sm text-text-secondary">{item.customer?.email || "No customer"} · idle {item.age.idleHours}h</p>
              </div>
            )) : <EmptyState icon={Clock3} title="No stale tickets" description="There are no stale tickets in the current queue." />}
          </div>
        </Card>
        <Card>
          <CardHeader><div><CardTitle>Escalated tickets</CardTitle><CardDescription>Escalated support issues with higher operational visibility.</CardDescription></div></CardHeader>
          <div className="space-y-3">
            {escalatedQuery.isPending ? <SectionLoader /> : escalatedQuery.isError ? <ErrorState title="Unable to load escalated tickets" description="Retry after confirming the escalated queue endpoint is available." onAction={() => void escalatedQuery.refetch()} /> : (escalatedQuery.data?.items || []).length ? escalatedQuery.data?.items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="font-medium text-text-primary">{item.subject}</p>
                <p className="mt-1 text-sm text-text-secondary">{item.customer?.email || "No customer"} · {item.priority} priority</p>
              </div>
            )) : <EmptyState icon={LifeBuoy} title="No escalated tickets" description="There are no escalated tickets in the current queue." />}
          </div>
        </Card>
      </div>

      <CreateTicketDialog open={addDisclosure.open} onClose={addDisclosure.onClose} />
    </section>
  );
}

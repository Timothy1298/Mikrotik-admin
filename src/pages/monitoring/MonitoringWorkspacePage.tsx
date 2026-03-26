import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  AcknowledgeIncidentModal,
  AddIncidentNoteModal,
  HealthStatusBadge,
  IncidentSeverityBadge,
  MarkIncidentReviewedModal,
  ResolveIncidentModal,
} from "@/features/monitoring/components";
import {
  useAcknowledgeIncident,
  useAddIncidentNote,
  useIncident,
  useMarkIncidentReviewed,
  useResolveIncident,
} from "@/features/monitoring/hooks/useMonitoring";
import type { MonitoringDetailItem, MonitoringIncident } from "@/features/monitoring/types/monitoring.types";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { formatBytes } from "@/lib/formatters/bytes";
import { formatDateTime } from "@/lib/formatters/date";
import { appRoutes } from "@/config/routes";

dayjs.extend(relativeTime);

type MonitoringWorkspaceState = {
  detail?: MonitoringDetailItem | null;
  incident?: MonitoringIncident | null;
};

function getTitle(detail: MonitoringDetailItem) {
  if (detail.kind === "diagnostic") return detail.item.resourceName;
  if (detail.kind === "activity") return detail.item.summary;
  if (detail.kind === "router") return detail.item.name;
  if (detail.kind === "vpn-server") return detail.item.name;
  if (detail.kind === "peer") return detail.item.peerName || detail.item.router.name;
  if (detail.kind === "customer") return detail.item.user.name || detail.item.user.email || "Customer impact";
  if (detail.kind === "traffic-router") return detail.item.name;
  if (detail.kind === "traffic-server") return detail.item.nodeId;
  return detail.item.title;
}

function SummaryMetric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <div className="space-y-3 p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{label}</p>
        <p className="text-3xl font-semibold text-text-primary">{value}</p>
        <p className="text-sm text-text-secondary">{hint}</p>
      </div>
    </Card>
  );
}

export function MonitoringWorkspacePage() {
  const { kind = "", id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as MonitoringWorkspaceState;

  const acknowledgeDisclosure = useDisclosure(false);
  const resolveDisclosure = useDisclosure(false);
  const reviewedDisclosure = useDisclosure(false);
  const noteDisclosure = useDisclosure(false);

  const incidentQuery = useIncident(id, kind === "incident");
  const acknowledgeMutation = useAcknowledgeIncident();
  const resolveMutation = useResolveIncident();
  const reviewedMutation = useMarkIncidentReviewed();
  const noteMutation = useAddIncidentNote();

  const detail = useMemo<MonitoringDetailItem | null>(() => {
    if (kind === "incident") {
      const incident = incidentQuery.data || state.incident || null;
      return incident ? { kind: "incident", item: incident } : null;
    }
    return state.detail || null;
  }, [incidentQuery.data, kind, state.detail, state.incident]);

  if (kind === "incident" && incidentQuery.isPending && !state.incident) return <PageLoader />;
  if (!detail) {
    return <ErrorState title="Unable to load monitoring workspace" description="This monitoring workspace needs a selected monitoring record. Re-open the item from the monitoring tables, or use an incident route that exists on the server." onAction={() => navigate(appRoutes.monitoringRouterHealth)} />;
  }

  const title = getTitle(detail);
  return (
    <section className="space-y-6">
      <PageHeader title={title} description="Route-driven monitoring workspace for operational context, infrastructure impact, and incident actions." meta={detail.kind.replace(/-/g, " ")} />

      <Card className="space-y-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-text-primary">{title}</h2>
              {detail.kind === "incident" ? <IncidentSeverityBadge severity={detail.item.severity} /> : null}
              {detail.kind === "incident" ? <HealthStatusBadge status={detail.item.status} /> : null}
              {detail.kind === "router" ? <HealthStatusBadge status={detail.item.healthSummary.state} /> : null}
              {detail.kind === "vpn-server" ? <HealthStatusBadge status={detail.item.healthSummary.status} /> : null}
              {detail.kind === "peer" ? <HealthStatusBadge status={detail.item.handshakeState} /> : null}
              {detail.kind === "diagnostic" ? <HealthStatusBadge status={detail.item.severity} /> : null}
              {detail.kind === "activity" ? <Badge tone="info">{detail.item.source}</Badge> : null}
            </div>
            <p className="text-sm text-text-secondary">
              {detail.kind === "incident"
                ? `${detail.item.sourceType} / ${detail.item.source}`
                : detail.kind === "router"
                  ? `${detail.item.customer?.name || "Unassigned customer"} • ${detail.item.serverNode}`
                  : detail.kind === "vpn-server"
                    ? `${detail.item.region} • ${detail.item.nodeId}`
                    : detail.kind === "peer"
                      ? `${detail.item.router.name} • ${detail.item.serverNode || "No server node"}`
                      : detail.kind === "customer"
                        ? `${detail.item.user.name || detail.item.user.email || detail.item.user.id}`
                        : detail.kind === "traffic-router"
                          ? `${detail.item.serverNode} • ${detail.item.user?.name || detail.item.user?.email || "Unknown customer"}`
                          : detail.kind === "traffic-server"
                            ? detail.item.nodeId
                            : detail.kind === "diagnostic"
                              ? `${detail.item.resourceType} • ${detail.item.resourceId}`
                              : `${detail.item.type} • ${formatDateTime(detail.item.timestamp)}`}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Monitoring tools</p>
            <div className="flex flex-wrap gap-2">
              {detail.kind === "incident" && detail.item.status === "open" ? <Button variant="outline" onClick={acknowledgeDisclosure.onOpen}>Acknowledge</Button> : null}
              {detail.kind === "incident" && detail.item.status !== "resolved" ? <Button variant="danger" onClick={resolveDisclosure.onOpen}>Resolve</Button> : null}
              {detail.kind === "incident" && detail.item.status === "resolved" ? <Button variant="outline" onClick={reviewedDisclosure.onOpen}>Mark reviewed</Button> : null}
              {detail.kind === "incident" ? <Button variant="outline" onClick={noteDisclosure.onOpen}>Add note</Button> : null}
              {detail.kind === "router" ? <Button variant="outline" onClick={() => navigate(appRoutes.routerDetail(detail.item.id))}>Open router record</Button> : null}
              {detail.kind === "vpn-server" ? <Button variant="outline" onClick={() => navigate(appRoutes.vpnServerDetail(detail.item.id))}>Open server record</Button> : null}
              {detail.kind === "peer" ? <Button variant="outline" onClick={() => navigate(appRoutes.routerDetail(detail.item.router.id))}>Open linked router</Button> : null}
              {detail.kind === "customer" ? <Button variant="outline" onClick={() => navigate(appRoutes.userDetail(detail.item.user.id))}>Open customer</Button> : null}
              <Button variant="ghost" onClick={() => navigate(appRoutes.monitoringRouterHealth)}>Back to monitoring</Button>
            </div>
          </div>
        </div>
      </Card>

      {detail.kind === "incident" ? (
        <>
          <div className="grid gap-5 xl:grid-cols-4">
            <SummaryMetric label="Affected routers" value={String(detail.item.impact.affectedRouters)} hint="Operational blast radius" />
            <SummaryMetric label="Affected users" value={String(detail.item.impact.affectedUsers)} hint="Customer impact" />
            <SummaryMetric label="First detected" value={detail.item.firstDetectedAt ? dayjs(detail.item.firstDetectedAt).fromNow() : "Unknown"} hint={formatDateTime(detail.item.firstDetectedAt)} />
            <SummaryMetric label="Last seen" value={detail.item.lastSeenAt ? dayjs(detail.item.lastSeenAt).fromNow() : "Unknown"} hint={formatDateTime(detail.item.lastSeenAt)} />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card>
              <div className="space-y-4 p-5">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Incident summary</h3>
                  <p className="text-sm text-text-secondary">{detail.item.incidentKey}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Severity</p><div className="mt-2"><IncidentSeverityBadge severity={detail.item.severity} /></div></div>
                  <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Status</p><div className="mt-2"><HealthStatusBadge status={detail.item.status} /></div></div>
                  <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Source</p><p className="mt-2 text-sm text-text-primary">{detail.item.sourceType} / {detail.item.source}</p></div>
                  <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Resolved at</p><p className="mt-2 text-sm text-text-primary">{formatDateTime(detail.item.resolvedAt)}</p></div>
                </div>
              </div>
            </Card>
            <Card>
              <div className="space-y-4 p-5">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Linked resources</h3>
                  <p className="text-sm text-text-secondary">Operational entities tied to this incident.</p>
                </div>
                <div className="space-y-3 text-sm text-text-primary">
                  {detail.item.relatedRouter ? <p>Router: <Link className="text-primary transition hover:text-text-primary" to={appRoutes.routerDetail(detail.item.relatedRouter.id)}>{detail.item.relatedRouter.name}</Link></p> : null}
                  {detail.item.relatedServer ? <p>Server: <Link className="text-primary transition hover:text-text-primary" to={appRoutes.vpnServerDetail(detail.item.relatedServer.id)}>{detail.item.relatedServer.name || detail.item.relatedServer.nodeId}</Link></p> : null}
                  {detail.item.relatedUser ? <p>User: <Link className="text-primary transition hover:text-text-primary" to={appRoutes.userDetail(detail.item.relatedUser.id)}>{detail.item.relatedUser.name || detail.item.relatedUser.email}</Link></p> : null}
                  {detail.item.relatedPeer ? <p>Peer: {detail.item.relatedPeer.name || detail.item.relatedPeer.id}</p> : null}
                  {!detail.item.relatedRouter && !detail.item.relatedServer && !detail.item.relatedUser && !detail.item.relatedPeer ? <p className="text-text-muted">No linked resources recorded.</p> : null}
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="space-y-4 p-5">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Notes / timeline</h3>
                <p className="text-sm text-text-secondary">Stored follow-up and incident handling context.</p>
              </div>
              <div className="space-y-3">
                {detail.item.notes.length ? detail.item.notes.map((note) => (
                  <div key={note.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Badge tone="info">{note.category}</Badge>
                      <span className="font-mono text-xs text-text-muted">{dayjs(note.createdAt).fromNow()}</span>
                    </div>
                    <p className="mt-3 text-text-primary">{note.body}</p>
                    <p className="mt-2 text-xs text-text-muted">by {note.author} • {formatDateTime(note.createdAt)}</p>
                  </div>
                )) : <p className="text-sm text-text-muted">No incident notes recorded.</p>}
              </div>
            </div>
          </Card>
        </>
      ) : null}

      {detail.kind !== "incident" ? (
        <div className="space-y-5">
          {detail.kind === "diagnostic" ? (
            <>
              <div className="grid gap-5 xl:grid-cols-3">
                <SummaryMetric label="Severity" value={detail.item.severity} hint={detail.item.resourceType} />
                <SummaryMetric label="Resource" value={detail.item.resourceName} hint={detail.item.resourceId} />
                <SummaryMetric label="Workspace" value={detail.item.resourceType} hint="Derived monitoring issue" />
              </div>
              <Card><div className="space-y-4 p-5"><div className="flex items-center gap-3"><HealthStatusBadge status={detail.item.severity} /><Badge tone="info">{detail.item.resourceType}</Badge></div><p className="text-sm text-text-primary">{detail.item.message}</p></div></Card>
            </>
          ) : null}

          {detail.kind === "activity" ? (
            <>
              <div className="grid gap-5 xl:grid-cols-3">
                <SummaryMetric label="Source" value={detail.item.source} hint={detail.item.type} />
                <SummaryMetric label="Severity" value={detail.item.severity} hint={dayjs(detail.item.timestamp).fromNow()} />
                <SummaryMetric label="Resource" value={detail.item.resource?.type || "None"} hint={detail.item.resource?.name || detail.item.resource?.id || "No linked resource"} />
              </div>
              <Card>
                <div className="space-y-4 p-5">
                  <p className="text-sm text-text-primary">{detail.item.summary}</p>
                  {detail.item.actor ? <p className="text-sm text-text-secondary">Actor: {detail.item.actor.name || detail.item.actor.email || detail.item.actor.id}</p> : null}
                  {detail.item.resource ? <p className="text-sm text-text-secondary">Resource: {detail.item.resource.name || detail.item.resource.type} ({detail.item.resource.id})</p> : null}
                </div>
              </Card>
            </>
          ) : null}

          {detail.kind === "router" ? (
            <>
              <div className="grid gap-5 xl:grid-cols-4">
                <SummaryMetric label="Connection" value={detail.item.connectionStatus} hint={detail.item.setupStatus} />
                <SummaryMetric label="Customer" value={detail.item.customer?.name || "Unassigned"} hint={detail.item.vpnIp || "No VPN IP"} />
                <SummaryMetric label="Last seen" value={dayjs(detail.item.lastSeen).fromNow()} hint={formatDateTime(detail.item.lastSeen)} />
                <SummaryMetric label="Last handshake" value={detail.item.lastHandshake ? dayjs(detail.item.lastHandshake).fromNow() : "Never"} hint={formatDateTime(detail.item.lastHandshake)} />
              </div>
              <Card>
                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap gap-2">
                    {(detail.item.healthSummary.issues || []).length ? detail.item.healthSummary.issues.map((issue) => <Badge key={issue} tone="warning">{issue.replace(/_/g, " ")}</Badge>) : <Badge tone="success">No active issues</Badge>}
                  </div>
                </div>
              </Card>
            </>
          ) : null}

          {detail.kind === "vpn-server" ? (
            <>
              <div className="grid gap-5 xl:grid-cols-4">
                <SummaryMetric label="Region" value={detail.item.region} hint={detail.item.nodeId} />
                <SummaryMetric label="Routers" value={String(detail.item.routerCount)} hint="Managed routers" />
                <SummaryMetric label="Peers" value={String(detail.item.activePeerCount)} hint="Active peers" />
                <SummaryMetric label="Heartbeat" value={dayjs(detail.item.lastHeartbeatAt).fromNow()} hint={formatDateTime(detail.item.lastHeartbeatAt)} />
              </div>
              <Card><div className="space-y-4 p-5"><div className="flex items-center gap-3"><HealthStatusBadge status={detail.item.healthSummary.status} />{detail.item.loadCapacitySummary.overloaded ? <Badge tone="danger">Overloaded</Badge> : detail.item.loadCapacitySummary.nearCapacity ? <Badge tone="warning">Near capacity</Badge> : <Badge tone="success">Stable load</Badge>}</div></div></Card>
            </>
          ) : null}

          {detail.kind === "peer" ? (
            <>
              <div className="grid gap-5 xl:grid-cols-4">
                <SummaryMetric label="Handshake" value={detail.item.handshakeState} hint={formatDateTime(detail.item.lastHandshake)} />
                <SummaryMetric label="Enabled" value={detail.item.enabled ? "Yes" : "No"} hint={detail.item.peerName || "Unnamed peer"} />
                <SummaryMetric label="RX" value={formatBytes(detail.item.transferRx)} hint="Ingress transfer" />
                <SummaryMetric label="TX" value={formatBytes(detail.item.transferTx)} hint="Egress transfer" />
              </div>
              <Card>
                <div className="space-y-4 p-5">
                  <p className="text-sm text-text-primary">Linked router: <Link className="text-primary transition hover:text-text-primary" to={appRoutes.routerDetail(detail.item.router.id)}>{detail.item.router.name}</Link></p>
                  {detail.item.user ? <p className="text-sm text-text-secondary">User: {detail.item.user.name || detail.item.user.email || detail.item.user.id}</p> : null}
                </div>
              </Card>
            </>
          ) : null}

          {detail.kind === "customer" ? (
            <>
              <div className="grid gap-5 xl:grid-cols-4">
                <SummaryMetric label="Offline routers" value={String(detail.item.offlineRouters)} hint="Current offline impact" />
                <SummaryMetric label="Unhealthy routers" value={String(detail.item.unhealthyRouters)} hint="Health pressure" />
                <SummaryMetric label="Provisioning failures" value={String(detail.item.failedProvisioningRouters)} hint="Setup issues" />
                <SummaryMetric label="Stale routers" value={String(detail.item.staleRouters)} hint={detail.item.affectedByServer ? "Server-linked impact" : "No server-linked issue"} />
              </div>
              <Card><div className="space-y-4 p-5"><p className="text-sm text-text-primary">{detail.item.user.name || detail.item.user.email || detail.item.user.id}</p></div></Card>
            </>
          ) : null}

          {detail.kind === "traffic-router" ? (
            <div className="grid gap-5 xl:grid-cols-4">
              <SummaryMetric label="Ingress" value={formatBytes(detail.item.transferRx)} hint="Router RX" />
              <SummaryMetric label="Egress" value={formatBytes(detail.item.transferTx)} hint="Router TX" />
              <SummaryMetric label="Total" value={formatBytes(detail.item.totalTransferBytes)} hint={detail.item.serverNode} />
              <SummaryMetric label="Customer" value={detail.item.user?.name || detail.item.user?.email || "Unknown"} hint={detail.item.name} />
            </div>
          ) : null}

          {detail.kind === "traffic-server" ? (
            <div className="grid gap-5 xl:grid-cols-3">
              <SummaryMetric label="Ingress" value={formatBytes(detail.item.transferRx)} hint="Server RX" />
              <SummaryMetric label="Egress" value={formatBytes(detail.item.transferTx)} hint="Server TX" />
              <SummaryMetric label="Total" value={formatBytes(detail.item.totalTransferBytes)} hint={detail.item.nodeId} />
            </div>
          ) : null}
        </div>
      ) : null}

      {detail.kind === "incident" ? <AcknowledgeIncidentModal open={acknowledgeDisclosure.open} loading={acknowledgeMutation.isPending} onClose={acknowledgeDisclosure.onClose} onConfirm={(reason) => acknowledgeMutation.mutate([detail.item.id, reason] as never, { onSuccess: () => acknowledgeDisclosure.onClose() })} /> : null}
      {detail.kind === "incident" ? <ResolveIncidentModal open={resolveDisclosure.open} loading={resolveMutation.isPending} onClose={resolveDisclosure.onClose} onConfirm={(reason) => resolveMutation.mutate([detail.item.id, reason] as never, { onSuccess: () => resolveDisclosure.onClose() })} /> : null}
      {detail.kind === "incident" ? <MarkIncidentReviewedModal open={reviewedDisclosure.open} loading={reviewedMutation.isPending} onClose={reviewedDisclosure.onClose} onConfirm={(reason) => reviewedMutation.mutate([detail.item.id, reason] as never, { onSuccess: () => reviewedDisclosure.onClose() })} /> : null}
      {detail.kind === "incident" ? <AddIncidentNoteModal open={noteDisclosure.open} loading={noteMutation.isPending} onClose={noteDisclosure.onClose} onConfirm={(payload) => noteMutation.mutate([detail.item.id, payload] as never, { onSuccess: () => noteDisclosure.onClose() })} /> : null}
    </section>
  );
}

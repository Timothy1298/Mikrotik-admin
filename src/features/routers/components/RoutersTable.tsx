import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/data-display/DataTable";
import { Dropdown } from "@/components/ui/Dropdown";
import { appRoutes } from "@/config/routes";
import { RouterPortStatusBadge } from "@/features/routers/components/RouterPortStatusBadge";
import { RouterSetupBadge } from "@/features/routers/components/RouterSetupBadge";
import { RouterStatusBadge } from "@/features/routers/components/RouterStatusBadge";
import { RouterTunnelHealthBadge } from "@/features/routers/components/RouterTunnelHealthBadge";
import type { RouterRow } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

function ApiStateBadge({ state }: { state: RouterRow["apiConnectivity"]["state"] }) {
  const styles = {
    healthy: "border-success/25 bg-success/10 text-success",
    failing: "border-danger/25 bg-danger/10 text-danger",
    pending: "border-warning/25 bg-warning/10 text-primary",
    unconfigured: "border-slate-500/20 bg-slate-500/10 text-text-secondary",
  } as const;

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-[0.18em] ${styles[state]}`}>{state}</span>;
}

export function RoutersTable({
  rows,
  onOpenDetails,
  onDisable,
  onDelete,
  onReactivate,
  onReprovision,
  onRegenerateSetup,
  onResetPeer,
  onReassignPorts,
  onMoveServer,
  onMarkReviewed,
  onAddNote,
  onAddFlag,
  emptyTitle = "No routers found",
  emptyDescription = "Adjust your filters or provision a new router to populate the fleet.",
}: {
  rows: RouterRow[];
  onOpenDetails: (row: RouterRow) => void;
  onDisable: (row: RouterRow) => void;
  onDelete: (row: RouterRow) => void;
  onReactivate: (row: RouterRow) => void;
  onReprovision: (row: RouterRow) => void;
  onRegenerateSetup: (row: RouterRow) => void;
  onResetPeer: (row: RouterRow) => void;
  onReassignPorts: (row: RouterRow) => void;
  onMoveServer: (row: RouterRow) => void;
  onMarkReviewed: (row: RouterRow) => void;
  onAddNote: (row: RouterRow) => void;
  onAddFlag: (row: RouterRow) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const navigate = useNavigate();
  const [navigatingRouterId, setNavigatingRouterId] = useState<string | null>(null);

  const openFullPage = (router: RouterRow) => {
    if (navigatingRouterId) return;
    setNavigatingRouterId(router.id);
    requestAnimationFrame(() => navigate(appRoutes.routerDetail(router.id)));
  };

  const columns = useMemo<ColumnDef<RouterRow>[]>(() => [
    {
      header: "Router",
      cell: ({ row }) => (
        <div className="space-y-1">
          <button
            type="button"
            className="inline-flex items-center gap-2 font-medium text-text-primary transition hover:text-primary"
            onClick={(event) => {
              event.stopPropagation();
              openFullPage(row.original);
            }}
          >
            {navigatingRouterId === row.original.id ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
            {row.original.name}
          </button>
          <p className="font-mono text-xs text-text-muted">{row.original.id}</p>
        </div>
      ),
    },
    {
      header: "Customer",
      cell: ({ row }) => row.original.customer ? <div><p className="text-sm text-text-primary">{row.original.customer.name}</p><p className="text-xs text-text-muted">{row.original.customer.email}</p></div> : <span className="text-sm text-text-muted">Unassigned</span>,
    },
    { header: "Status", cell: ({ row }) => <RouterStatusBadge status={row.original.status} /> },
    { header: "Setup", cell: ({ row }) => <RouterSetupBadge status={row.original.setupStatus} /> },
    { header: "Tunnel", cell: ({ row }) => <RouterTunnelHealthBadge status={row.original.healthSummary.state} /> },
    { header: "VPN IP", cell: ({ row }) => <span className="font-mono text-xs text-text-secondary">{row.original.vpnIp}</span> },
    { header: "Server", cell: ({ row }) => <span className="text-sm text-text-primary">{row.original.serverNode}</span> },
    { header: "Ports", cell: ({ row }) => <div className="flex flex-wrap gap-1"><RouterPortStatusBadge status={row.original.winboxPort ? "assigned" : "missing"} /><RouterPortStatusBadge status={row.original.sshPort ? "assigned" : "missing"} /><RouterPortStatusBadge status={row.original.apiPort ? "assigned" : "missing"} /></div> },
    { header: "API", cell: ({ row }) => <ApiStateBadge state={row.original.apiConnectivity.state} /> },
    { header: "Last seen", cell: ({ row }) => <span className="font-mono text-xs text-text-secondary">{formatDateTime(row.original.lastSeen)}</span> },
    { header: "Last handshake", cell: ({ row }) => <span className="font-mono text-xs text-text-secondary">{formatDateTime(row.original.lastHandshake)}</span> },
    {
      header: "Actions",
      cell: ({ row }) => (
        <Dropdown
          items={[
            { label: "Open full page", onClick: () => openFullPage(row.original) },
            { label: "Open workspace", onClick: () => onOpenDetails(row.original) },
            row.original.status === "inactive"
              ? { label: "Reactivate router", onClick: () => onReactivate(row.original) }
              : { label: "Disable router", onClick: () => onDisable(row.original), danger: true },
            { label: "Delete router", onClick: () => onDelete(row.original), danger: true },
            { label: "Reprovision", onClick: () => onReprovision(row.original) },
            { label: "Regenerate setup", onClick: () => onRegenerateSetup(row.original) },
            { label: "Reset peer", onClick: () => onResetPeer(row.original) },
            { label: "Reassign ports", onClick: () => onReassignPorts(row.original) },
            { label: "Move server", onClick: () => onMoveServer(row.original) },
            { label: "Mark reviewed", onClick: () => onMarkReviewed(row.original) },
            { label: "Add note", onClick: () => onAddNote(row.original) },
            { label: "Flag router", onClick: () => onAddFlag(row.original) },
          ]}
        />
      ),
    },
  ], [navigate, navigatingRouterId, onAddFlag, onAddNote, onDelete, onDisable, onMarkReviewed, onMoveServer, onOpenDetails, onReactivate, onRegenerateSetup, onReassignPorts, onReprovision, onResetPeer]);

  return <DataTable data={rows} columns={columns} onRowClick={openFullPage} emptyTitle={emptyTitle} emptyDescription={emptyDescription} />;
}

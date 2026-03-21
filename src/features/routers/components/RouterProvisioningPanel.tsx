import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { RouterSetupBadge } from "@/features/routers/components/RouterSetupBadge";
import type { RouterDetail } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

export function RouterProvisioningPanel({ router }: { router: RouterDetail }) {
  const provisioning = router.provisioning;
  const managementOnly = router.profile.connectionMode === "management_only";

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Provisioning summary</CardTitle>
          <CardDescription>
            {managementOnly
              ? "Discovery import lifecycle, captured management details, and attachment timestamps."
              : "Setup lifecycle, generated configuration state, and provisioning timestamps."}
          </CardDescription>
        </div>
      </CardHeader>
      <div className="flex flex-wrap items-center gap-3">
        <RouterSetupBadge status={provisioning.state} />
        <span className="rounded-xl border border-background-border bg-background-panel px-3 py-1 text-xs text-text-secondary">{provisioning.configGenerationStatus.replace(/_/g, " ")}</span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Created</p><p className="mt-3 text-sm text-text-primary">{formatDateTime(provisioning.timestamps.createdAt)}</p></div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">{managementOnly ? "Local address" : "Setup generated"}</p><p className="mt-3 text-sm text-text-primary">{managementOnly ? (provisioning.assignedResources.localAddress || "Unavailable") : formatDateTime(provisioning.timestamps.setupGeneratedAt)}</p></div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">{managementOnly ? "Open ports" : "First connected"}</p><p className="mt-3 text-sm text-text-primary">{managementOnly ? (provisioning.assignedResources.openPorts.length ? provisioning.assignedResources.openPorts.join(", ") : "Unavailable") : formatDateTime(provisioning.timestamps.firstConnectedAt)}</p></div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">{managementOnly ? "Discovery source" : "Last reconfigured"}</p><p className="mt-3 text-sm text-text-primary">{managementOnly ? (router.discovery.source || "Unavailable") : formatDateTime(provisioning.timestamps.lastReconfiguredAt)}</p></div>
      </div>
      {provisioning.provisioningError ? <div className="mt-4 rounded-2xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">{provisioning.provisioningError}</div> : null}
    </Card>
  );
}

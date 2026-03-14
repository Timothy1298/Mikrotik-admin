import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { RouterSetupBadge } from "@/features/routers/components/RouterSetupBadge";
import type { RouterDetail } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

export function RouterProvisioningPanel({ router }: { router: RouterDetail }) {
  const provisioning = router.provisioning;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Provisioning summary</CardTitle>
          <CardDescription>Setup lifecycle, generated configuration state, and provisioning timestamps.</CardDescription>
        </div>
      </CardHeader>
      <div className="flex flex-wrap items-center gap-3">
        <RouterSetupBadge status={provisioning.state} />
        <span className="rounded-xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-3 py-1 text-xs text-slate-300">{provisioning.configGenerationStatus.replace(/_/g, " ")}</span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Created</p><p className="mt-3 text-sm text-slate-100">{formatDateTime(provisioning.timestamps.createdAt)}</p></div>
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Setup generated</p><p className="mt-3 text-sm text-slate-100">{formatDateTime(provisioning.timestamps.setupGeneratedAt)}</p></div>
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">First connected</p><p className="mt-3 text-sm text-slate-100">{formatDateTime(provisioning.timestamps.firstConnectedAt)}</p></div>
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Last reconfigured</p><p className="mt-3 text-sm text-slate-100">{formatDateTime(provisioning.timestamps.lastReconfiguredAt)}</p></div>
      </div>
      {provisioning.provisioningError ? <div className="mt-4 rounded-2xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">{provisioning.provisioningError}</div> : null}
    </Card>
  );
}

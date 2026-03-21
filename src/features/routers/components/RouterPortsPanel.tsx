import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { RouterPortStatusBadge } from "@/features/routers/components/RouterPortStatusBadge";
import type { RouterDetail } from "@/features/routers/types/router.types";

export function RouterPortsPanel({ router }: { router: RouterDetail }) {
  const ports = router.accessPorts;
  const managementOnly = router.profile.connectionMode === "management_only";

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Public access / ports</CardTitle>
          <CardDescription>
            {managementOnly
              ? "Management-only routers use their existing local management path and do not require public proxy mappings."
              : "Winbox, SSH, and API mappings plus forwarding health visibility."}
          </CardDescription>
        </div>
      </CardHeader>
      {managementOnly ? (
        <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-secondary">
          This router was attached for management only. Public proxy ports are not allocated. Use the stored local RouterOS API access path instead.
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { key: "winbox", label: "Winbox", value: ports.winbox },
          { key: "ssh", label: "SSH", value: ports.ssh },
          { key: "api", label: "API", value: ports.api },
        ].map((item) => (
          <div key={item.key} className="rounded-2xl border border-background-border bg-background-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                <p className="mt-2 font-mono text-lg text-text-primary">{item.value.publicPort ?? "—"}</p>
                <p className="mt-1 text-xs text-text-muted">target {item.value.targetPort}</p>
              </div>
              <div className="flex flex-col gap-2">
                <RouterPortStatusBadge status={item.value.allocationStatus} />
                <RouterPortStatusBadge status={item.value.forwardingStatus} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

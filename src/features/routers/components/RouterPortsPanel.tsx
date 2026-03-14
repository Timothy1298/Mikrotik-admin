import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { RouterPortStatusBadge } from "@/features/routers/components/RouterPortStatusBadge";
import type { RouterDetail } from "@/features/routers/types/router.types";

export function RouterPortsPanel({ router }: { router: RouterDetail }) {
  const ports = router.accessPorts;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Public access / ports</CardTitle>
          <CardDescription>Winbox, SSH, and API mappings plus forwarding health visibility.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { key: "winbox", label: "Winbox", value: ports.winbox },
          { key: "ssh", label: "SSH", value: ports.ssh },
          { key: "api", label: "API", value: ports.api },
        ].map((item) => (
          <div key={item.key} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-100">{item.label}</p>
                <p className="mt-2 font-mono text-lg text-slate-100">{item.value.publicPort ?? "—"}</p>
                <p className="mt-1 text-xs text-slate-500">target {item.value.targetPort}</p>
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

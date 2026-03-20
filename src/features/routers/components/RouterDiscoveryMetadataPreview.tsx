import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { RouterDiscoveryCandidateVerification } from "@/features/routers/types/router.types";

export function RouterDiscoveryMetadataPreview({ verification }: { verification: RouterDiscoveryCandidateVerification }) {
  const metadata = verification.metadata;
  const readiness = verification.readiness;

  return (
    <Card className="border-brand-500/20 bg-[rgba(37,99,235,0.08)]">
      <CardHeader>
        <div>
          <CardTitle>Router metadata</CardTitle>
          <CardDescription>Inspection results fetched after credential verification.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 text-sm text-slate-300">
          <p><span className="text-slate-500">Identity:</span> {metadata?.identity || "-"}</p>
          <p><span className="text-slate-500">Verification:</span> {verification.method ? verification.method.toUpperCase() : "-"}</p>
          <p><span className="text-slate-500">Board:</span> {metadata?.boardName || "-"}</p>
          <p><span className="text-slate-500">Model:</span> {metadata?.model || "-"}</p>
          <p><span className="text-slate-500">Serial:</span> {metadata?.serialNumber || "-"}</p>
          <p><span className="text-slate-500">RouterOS:</span> {metadata?.routerosVersion || "-"}</p>
          <p><span className="text-slate-500">Interfaces:</span> {metadata?.interfaceCount ?? 0}</p>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge tone={readiness?.status === "ready" ? "success" : readiness?.status === "blocked" ? "danger" : "warning"}>
              {readiness?.status || "warning"}
            </Badge>
            {readiness?.sshReachable ? <Badge tone="success">SSH reachable</Badge> : <Badge tone="warning">SSH unavailable</Badge>}
            {readiness?.apiReachable ? <Badge tone="info">API reachable</Badge> : null}
            {readiness?.winboxReachable ? <Badge tone="info">Winbox reachable</Badge> : null}
            {readiness?.wireGuardReady ? <Badge tone="success">WireGuard ready</Badge> : <Badge tone="warning">WireGuard check needed</Badge>}
          </div>
          {(readiness?.reasons || []).length ? (
            <div className="space-y-2">
              {(readiness?.reasons || []).map((reason) => (
                <p key={reason} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-3 py-2 text-xs text-slate-300">
                  {reason}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No blocking readiness issues detected.</p>
          )}
        </div>
      </div>
    </Card>
  );
}

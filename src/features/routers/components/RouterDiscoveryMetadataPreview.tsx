import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { RouterDiscoveryCandidateVerification } from "@/features/routers/types/router.types";

export function RouterDiscoveryMetadataPreview({ verification }: { verification: RouterDiscoveryCandidateVerification }) {
  const metadata = verification.metadata;
  const readiness = verification.readiness;

  return (
    <Card className="border-primary/20 bg-primary/10">
      <CardHeader>
        <div>
          <CardTitle>Router metadata</CardTitle>
          <CardDescription>Inspection results fetched after credential verification.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 text-sm text-text-secondary">
          <p><span className="text-text-muted">Identity:</span> {metadata?.identity || "-"}</p>
          <p><span className="text-text-muted">Verification:</span> {verification.method ? verification.method.toUpperCase() : "-"}</p>
          <p><span className="text-text-muted">Board:</span> {metadata?.boardName || "-"}</p>
          <p><span className="text-text-muted">Model:</span> {metadata?.model || "-"}</p>
          <p><span className="text-text-muted">Serial:</span> {metadata?.serialNumber || "-"}</p>
          <p><span className="text-text-muted">RouterOS:</span> {metadata?.routerosVersion || "-"}</p>
          <p><span className="text-text-muted">Interfaces:</span> {metadata?.interfaceCount ?? 0}</p>
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
                <p key={reason} className="rounded-2xl border border-background-border bg-background-panel px-3 py-2 text-xs text-text-secondary">
                  {reason}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">No blocking readiness issues detected.</p>
          )}
        </div>
      </div>
    </Card>
  );
}

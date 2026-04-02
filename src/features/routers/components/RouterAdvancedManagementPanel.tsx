import { useState } from "react";
import { AlertTriangle, GitBranch, KeyRound, Route, Shield, ShieldCheck, Workflow } from "lucide-react";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useSetRouterSafeMode } from "@/features/routers/hooks/useRouter";
import type { RouterDetail } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

function ConfidenceBadge({ score, band }: { score: number; band: "high" | "medium" | "low" }) {
  const tone = band === "high" ? "text-success border-success/25 bg-success/10" : band === "medium" ? "text-primary border-primary/25 bg-primary/10" : "text-danger border-danger/25 bg-danger/10";
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${tone}`}>{band} confidence • {score}</span>;
}

export function RouterAdvancedManagementPanel({ router }: { router: RouterDetail }) {
  const safeModeMutation = useSetRouterSafeMode();
  const [breakGlassCode, setBreakGlassCode] = useState("");
  const [note, setNote] = useState(router.management.safeMode.note || "");
  const [inlineError, setInlineError] = useState<string | null>(null);

  const saveSafeMode = async (enabled: boolean) => {
    setInlineError(null);
    try {
      await safeModeMutation.mutateAsync({
        id: router.id,
        payload: {
          enabled,
          requireBreakGlass: true,
          breakGlassCode: breakGlassCode || undefined,
          note: note || undefined,
          reason: enabled ? "Enabled router safe mode" : "Disabled router safe mode",
        },
      });
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to update router safe mode.");
    }
  };

  const wizardSteps = [
    `Provision WireGuard management using ${router.management.bootstrap.managementInterfaceName}.`,
    `Allow RouterOS API on port ${router.apiAccess.apiPort} only from ${router.management.bootstrap.apiAllowedSources.join(", ") || "approved management sources"}.`,
    `Allow SSH from ${router.management.bootstrap.sshAllowedSources.join(", ") || "approved management sources"} and use it as the preferred advanced terminal path.`,
    "Verify endpoint identity and serial before enabling customer-impacting operations.",
  ];

  return (
    <Card className="space-y-5">
      <CardHeader>
        <div>
          <CardTitle>Advanced remote management</CardTitle>
          <CardDescription>Endpoint confidence, path mapping, drift detection, bootstrap guidance, safe mode, and backup restore readiness for this router.</CardDescription>
        </div>
      </CardHeader>

      <div className="grid gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Endpoint confidence</p>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3">
            <ConfidenceBadge score={router.management.endpointConfidence.score} band={router.management.endpointConfidence.band} />
          </div>
          <div className="mt-3 space-y-1 text-xs text-text-secondary">
            {router.management.endpointConfidence.factors.map((factor) => <p key={factor}>{factor}</p>)}
          </div>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Drift events</p>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-text-primary">{router.management.drift.activeCount}</p>
          <p className="mt-1 text-sm text-text-secondary">Last detected {formatDateTime(router.management.drift.lastDetectedAt)}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Safe mode</p>
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-sm font-semibold text-text-primary">{router.management.safeMode.enabled ? "Enabled" : "Disabled"}</p>
          <p className="mt-1 text-xs text-text-secondary">Break-glass configured: {router.management.safeMode.breakGlassConfigured ? "yes" : "no"}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Backup restore readiness</p>
            <KeyRound className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-sm font-semibold text-text-primary">{router.backupSummary.latest?.metadata?.restoreCompatible === false ? "Review required" : "Validated"}</p>
          <p className="mt-1 text-xs text-text-secondary">
            {router.backupSummary.latest?.metadata?.lastRestoreTestAt
              ? `Validated ${formatDateTime(router.backupSummary.latest.metadata.lastRestoreTestAt)}`
              : `Latest backup ${formatDateTime(router.backupSummary.latest?.createdAt || null)}`}
          </p>
        </div>
      </div>

      {inlineError ? <InlineError message={inlineError} /> : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-primary" />
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Management path map</p>
          </div>
          <div className="mt-4 space-y-3">
            {router.management.pathMap.candidates.map((path) => (
              <div key={`${path.endpointId}-${path.host}-${path.port}`} className="rounded-2xl border border-background-border bg-black/10 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-text-primary">{path.label}</p>
                    <p className="mt-1 font-mono text-xs text-text-muted">{path.host}:{path.port} • {path.transport} • {path.pathType}</p>
                  </div>
                  <div className="text-right text-xs text-text-secondary">
                    <p>{path.health}</p>
                    <p>{path.failureType || "healthy path"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Recent path observations</p>
            <div className="mt-3 space-y-2 text-sm text-text-secondary">
              {router.management.pathMap.recentObservations.length ? router.management.pathMap.recentObservations.map((item, index) => (
                <p key={`${item.endpointId || "ep"}-${item.observedAt || index}`}>
                  {formatDateTime(item.observedAt)} • {item.operationName || "operation"} • {item.outcome}
                  {item.host ? ` • ${item.host}:${item.port || ""}` : ""}
                  {item.failureType ? ` • ${item.failureType}` : ""}
                </p>
              )) : <p>No path observations recorded yet.</p>}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Safe mode / break-glass</p>
          </div>
          <div className="mt-4 grid gap-4">
            <Input label="Break-glass code" value={breakGlassCode} onChange={(event) => setBreakGlassCode(event.target.value)} placeholder="Optional emergency code" />
            <Input label="Operator note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Why safe mode is enabled" />
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={() => void saveSafeMode(false)} isLoading={safeModeMutation.isPending}>
                Disable safe mode
              </Button>
              <Button onClick={() => void saveSafeMode(true)} isLoading={safeModeMutation.isPending}>
                Enable safe mode
              </Button>
            </div>
            <p className="text-xs text-text-muted">When safe mode is enabled, risky remote actions now require explicit break-glass acknowledgement, and any saved code is validated before the operation is allowed.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Endpoint rebind history</p>
          </div>
          <div className="mt-4 space-y-3">
            {router.management.endpointHistory.length ? router.management.endpointHistory.map((item, index) => (
              <div key={`${item.changedAt || index}-${item.nextHost || "host"}`} className="rounded-2xl border border-background-border bg-black/10 px-4 py-3 text-sm text-text-secondary">
                <p className="font-medium text-text-primary">{item.previousHost || "unset"} → {item.nextHost || "unset"}</p>
                <p className="mt-1">{formatDateTime(item.changedAt)} • {item.changedBy} • {item.validationState}</p>
                <p className="mt-1">{item.reason || "No reason recorded"}</p>
                {item.validationMessage ? <p className="mt-1 text-xs text-text-muted">{item.validationMessage}</p> : null}
              </div>
            )) : <p className="text-sm text-text-secondary">No endpoint changes recorded yet.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-primary" />
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Tunnel-first onboarding wizard</p>
          </div>
          <div className="mt-4 space-y-3 text-sm text-text-secondary">
            <p className="text-text-primary">Bootstrap mode: {router.management.bootstrap.bootstrapMode.replace(/_/g, " ")}</p>
            <p className="text-text-primary">Management interface: {router.management.bootstrap.managementInterfaceName}</p>
            {wizardSteps.map((step) => (
              <div key={step} className="rounded-2xl border border-background-border bg-black/10 px-4 py-3">{step}</div>
            ))}
            <p className="text-xs text-text-muted">Use “Regenerate setup” to refresh the WireGuard and bootstrap package after changing server, keys, or management policy.</p>
          </div>
        </div>
      </div>

      {router.management.drift.events.length ? (
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Automatic drift detection</p>
          <div className="mt-4 space-y-3">
            {router.management.drift.events.map((event, index) => (
              <div key={`${event.detectedAt || index}-${event.eventType}`} className="rounded-2xl border border-background-border bg-black/10 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-text-primary">{event.message}</p>
                  <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{event.severity}</span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">{formatDateTime(event.detectedAt)} • {event.eventType.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

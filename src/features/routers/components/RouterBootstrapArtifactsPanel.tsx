import { useMemo } from "react";
import { CheckCircle2, Copy, Download, FileCode2, KeyRound, Network, TerminalSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useMarkRouterBootstrapApplied } from "@/features/routers/hooks/useRouter";
import type { RouterDetail, RouterSetupArtifacts } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function copyText(content: string, label: string) {
  await navigator.clipboard.writeText(content);
  toast.success(`${label} copied`);
}

function ArtifactBlock({
  title,
  description,
  value,
  copyLabel,
  downloadName,
}: {
  title: string;
  description: string;
  value: string;
  copyLabel: string;
  downloadName: string;
}) {
  return (
    <div className="rounded-2xl border border-background-border bg-background-panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text-primary">{title}</p>
          <p className="mt-1 text-xs text-text-muted">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" leftIcon={<Copy className="h-4 w-4" />} onClick={() => void copyText(value, copyLabel)}>
            Copy
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={() => downloadText(downloadName, value)}>
            Export
          </Button>
        </div>
      </div>
      <textarea
        readOnly
        value={value}
        className="mt-4 min-h-[14rem] w-full rounded-2xl border border-background-border bg-black/20 p-4 font-mono text-xs text-text-primary outline-none"
      />
    </div>
  );
}

export function RouterBootstrapArtifactsPanel({
  router,
  artifacts,
  onOpenApiAccess,
  onOpenPingTest,
  onOpenConnectivity,
  onOpenTerminal,
}: {
  router: RouterDetail;
  artifacts: RouterSetupArtifacts | null;
  onOpenApiAccess?: () => void;
  onOpenPingTest?: () => void;
  onOpenConnectivity?: () => void;
  onOpenTerminal?: () => void;
}) {
  const markAppliedMutation = useMarkRouterBootstrapApplied();
  const effectiveArtifacts = artifacts;
  const defaultBootstrapScript = useMemo(() => {
    const bootstrap = router.management.bootstrap;
    return [
      `# Bootstrap mode: ${bootstrap.bootstrapMode}`,
      `# Management interface: ${bootstrap.managementInterfaceName}`,
      `# API allow-list: ${(bootstrap.apiAllowedSources || []).join(", ") || "not set"}`,
      `# SSH allow-list: ${(bootstrap.sshAllowedSources || []).join(", ") || "not set"}`,
      "# Generate fresh setup artifacts to obtain the full RouterOS management bootstrap package.",
    ].join("\n");
  }, [router.management.bootstrap]);
  const checklist = useMemo(() => {
    const pingReachable = Boolean(router.pingHistory?.[0]?.reachable);
    const identityVerified = router.connectivity.endpointContract?.state === "verified_local" || router.connectivity.endpointContract?.state === "verified_wireguard";
    const apiHealthy = router.apiAccess.state === "healthy";
    const tunnelReady = router.connectivity.tunnelStatus === "healthy" || router.connectivity.tunnelStatus === "management_only";
    const terminalPathReady = router.management.pathMap.primaryPath?.transport === "ssh" || apiHealthy;

    return [
      {
        key: "ping",
        title: "Ping test",
        description: pingReachable
          ? `Last ping succeeded at ${router.pingHistory?.[0]?.createdAt ? formatDateTime(router.pingHistory[0].createdAt) : "unknown time"}.`
          : "Run the ping test after applying the script to confirm the router can reach the expected management target.",
        complete: pingReachable,
        actionLabel: "Run ping test",
        onAction: onOpenPingTest,
      },
      {
        key: "identity",
        title: "Identity verification",
        description: identityVerified
          ? `Endpoint contract is ${router.connectivity.endpointContract?.state?.replace(/_/g, " ")}.`
          : "Use the API access panel to verify the endpoint identity and clear any mismatch before continuing.",
        complete: identityVerified,
        actionLabel: "Open API access",
        onAction: onOpenApiAccess,
      },
      {
        key: "api",
        title: "RouterOS API test",
        description: apiHealthy
          ? `API health is ${router.apiAccess.state}.`
          : "Run “Test RouterOS API” after bootstrap to confirm credentials, API reachability, and interface discovery.",
        complete: apiHealthy,
        actionLabel: "Open API access",
        onAction: onOpenApiAccess,
      },
      {
        key: "terminal",
        title: "Terminal path check",
        description: terminalPathReady
          ? `Primary terminal path is ${router.management.pathMap.primaryPath?.transport || "available"}.`
          : "Open Terminal and confirm SSH-over-management path or API-console fallback is available.",
        complete: terminalPathReady,
        actionLabel: "Open terminal",
        onAction: onOpenTerminal,
      },
      {
        key: "tunnel",
        title: "Tunnel health",
        description: tunnelReady
          ? `Tunnel status is ${router.connectivity.tunnelStatus}.`
          : "Check the tunnel handshake and path-map observations after applying the bootstrap package.",
        complete: tunnelReady,
        actionLabel: "Open connectivity",
        onAction: onOpenConnectivity,
      },
    ];
  }, [onOpenApiAccess, onOpenConnectivity, onOpenPingTest, onOpenTerminal, router.apiAccess.state, router.connectivity.endpointContract?.state, router.connectivity.tunnelStatus, router.management.pathMap.primaryPath?.transport, router.pingHistory]);

  return (
    <Card className="space-y-5">
      <CardHeader>
        <div>
          <CardTitle>Bootstrap package</CardTitle>
          <CardDescription>Dedicated copy/export workflow for WireGuard onboarding, remote bootstrap, and RouterOS management package handoff.</CardDescription>
        </div>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Generated</p>
            <FileCode2 className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-sm font-semibold text-text-primary">{formatDateTime(effectiveArtifacts?.generatedAt || router.management.bootstrap.generatedAt)}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Bootstrap mode</p>
            <Network className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-sm font-semibold text-text-primary">{(effectiveArtifacts?.bootstrapProfile?.bootstrapMode || router.management.bootstrap.bootstrapMode).replace(/_/g, " ")}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Management interface</p>
            <KeyRound className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-sm font-semibold text-text-primary">{effectiveArtifacts?.bootstrapProfile?.managementInterfaceName || router.management.bootstrap.managementInterfaceName}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-background-border bg-background-panel p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Bootstrap apply status</p>
          <p className="mt-2 text-sm font-semibold text-text-primary">
            {router.management.bootstrap.lastAppliedAt ? `Applied ${formatDateTime(router.management.bootstrap.lastAppliedAt)}` : "Not marked applied yet"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void markAppliedMutation.mutateAsync({ id: router.id, payload: { reason: "Marked bootstrap package as applied from the router workspace" } })}
          isLoading={markAppliedMutation.isPending}
        >
          Mark applied
        </Button>
      </div>

      <ArtifactBlock
        title="Management bootstrap script"
        description="RouterOS bootstrap for tunnel-first remote management, API/SSH policy, and management path preparation."
        value={effectiveArtifacts?.managementBootstrapScript || defaultBootstrapScript}
        copyLabel="Management bootstrap script"
        downloadName={`${router.profile.name}-management-bootstrap.rsc`}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <ArtifactBlock
          title="MikroTik setup script"
          description="Direct RouterOS setup script for the assigned WireGuard peer and management route."
          value={effectiveArtifacts?.mikrotikScript || "Regenerate setup to load the latest MikroTik setup script."}
          copyLabel="MikroTik setup script"
          downloadName={`${router.profile.name}-setup.rsc`}
        />
        <ArtifactBlock
          title="WireGuard config"
          description="Peer material and network assignment for this router."
          value={effectiveArtifacts?.wireguardConfig || "Regenerate setup to load the latest WireGuard config."}
          copyLabel="WireGuard config"
          downloadName={`${router.profile.name}.conf`}
        />
      </div>

      <div className="rounded-2xl border border-background-border bg-background-panel p-4">
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-4 w-4 text-primary" />
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Apply checklist</p>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {checklist.map((item) => (
            <div key={item.key} className="rounded-2xl border border-background-border bg-black/10 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className={`mt-0.5 h-4 w-4 flex-shrink-0 ${item.complete ? "text-success" : "text-text-muted"}`} />
                <div>
                  <p className="text-sm font-medium text-text-primary">{item.title}</p>
                  <p className="mt-1 text-xs text-text-secondary">{item.description}</p>
                </div>
              </div>
              {item.onAction ? (
                <Button variant="outline" size="sm" onClick={item.onAction}>
                  {item.actionLabel}
                </Button>
              ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

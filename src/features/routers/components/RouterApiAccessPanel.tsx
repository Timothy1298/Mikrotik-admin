import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, Network, PlugZap, ShieldAlert } from "lucide-react";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useSetRouterAccess, useSetRouterCredentials, useTestRouterConnection } from "@/features/routers/hooks/useRouter";
import type { RouterApiConnectionTest, RouterDetail } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

function StatusBadge({ state }: { state: RouterDetail["apiAccess"]["state"] }) {
  const styles = {
    healthy: "border-success/25 bg-success/10 text-success",
    failing: "border-danger/25 bg-danger/10 text-danger",
    pending: "border-warning/25 bg-warning/10 text-primary",
    unconfigured: "border-slate-500/20 bg-slate-500/10 text-text-secondary",
  } as const;

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${styles[state]}`}>
      {state}
    </span>
  );
}

export function RouterApiAccessPanel({ router, anchorId }: { router: RouterDetail; anchorId?: string }) {
  const setAccessMutation = useSetRouterAccess();
  const setCredentialsMutation = useSetRouterCredentials();
  const testConnectionMutation = useTestRouterConnection();
  const primaryManualEndpoint = (router.connectivity.endpoints || []).find((endpoint) => !endpoint.derived) || null;
  const [apiUsername, setApiUsername] = useState(router.apiAccess.username || "admin");
  const [apiPassword, setApiPassword] = useState("");
  const [apiPort, setApiPort] = useState(String(router.apiAccess.apiPort || 8728));
  const [managementHost, setManagementHost] = useState(primaryManualEndpoint?.host || router.discovery.localAddress || "");
  const [hostname, setHostname] = useState(router.connectivity.endpointContract?.expectedIdentity || router.discovery.hostname || router.profile.hostname || "");
  const [sshPort, setSshPort] = useState(String(primaryManualEndpoint?.transport === "ssh" ? primaryManualEndpoint.port : (router.accessPorts.ssh.targetPort || 22)));
  const [reason, setReason] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [result, setResult] = useState<RouterApiConnectionTest | null>(null);
  const mismatchState = router.connectivity.endpointContract?.state === "mismatch";

  useEffect(() => {
    const nextManualEndpoint = (router.connectivity.endpoints || []).find((endpoint) => !endpoint.derived) || null;
    setApiUsername(router.apiAccess.username || "admin");
    setApiPort(String(router.apiAccess.apiPort || 8728));
    setManagementHost(nextManualEndpoint?.host || router.discovery.localAddress || "");
    setHostname(router.connectivity.endpointContract?.expectedIdentity || router.discovery.hostname || router.profile.hostname || "");
    setSshPort(String(nextManualEndpoint?.transport === "ssh" ? nextManualEndpoint.port : (router.accessPorts.ssh.targetPort || 22)));
    setApiPassword("");
    setReason("");
  }, [router.accessPorts.ssh.targetPort, router.apiAccess.apiPort, router.apiAccess.username, router.connectivity.endpointContract?.expectedIdentity, router.connectivity.endpoints, router.discovery.hostname, router.discovery.localAddress, router.id, router.profile.hostname]);

  const handleSave = async () => {
    const parsedPort = Number(apiPort);
    if (!apiUsername.trim()) {
      setInlineError("API username is required.");
      return;
    }
    if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
      setInlineError("API port must be a valid port between 1 and 65535.");
      return;
    }

    setInlineError(null);
    try {
      await setCredentialsMutation.mutateAsync({
        id: router.id,
        payload: {
          apiUsername: apiUsername.trim(),
          apiPassword: apiPassword || undefined,
          apiPort: parsedPort,
          reason: reason.trim() || undefined,
        },
      });
      setApiPassword("");
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to update RouterOS API credentials.");
    }
  };

  const handleTest = async () => {
    setInlineError(null);
    try {
      const nextResult = await testConnectionMutation.mutateAsync({
        id: router.id,
        reason: reason.trim() || undefined,
      });
      setResult(nextResult);
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "RouterOS API connection failed.");
    }
  };

  const handleSaveAccess = async (runTest = false) => {
    const trimmedHost = managementHost.trim();
    const trimmedHostname = hostname.trim();
    const parsedApiPort = Number(apiPort);
    const parsedSshPort = Number(sshPort);

    if (!trimmedHost && !trimmedHostname) {
      setInlineError("Provide a management host or expected identity to rebind this router.");
      return;
    }
    if (!Number.isInteger(parsedApiPort) || parsedApiPort < 1 || parsedApiPort > 65535) {
      setInlineError("API port must be a valid port between 1 and 65535.");
      return;
    }
    if (!Number.isInteger(parsedSshPort) || parsedSshPort < 1 || parsedSshPort > 65535) {
      setInlineError("SSH port must be a valid port between 1 and 65535.");
      return;
    }

    setInlineError(null);
    setResult(null);

    try {
      await setAccessMutation.mutateAsync({
        id: router.id,
        payload: {
          managementHost: trimmedHost || undefined,
          hostname: trimmedHostname || undefined,
          apiPort: parsedApiPort,
          sshPort: parsedSshPort,
          reason: reason.trim() || undefined,
        },
      });

      if (runTest) {
        const nextResult = await testConnectionMutation.mutateAsync({
          id: router.id,
          reason: reason.trim() || "Re-tested endpoint after management rebind",
        });
        setResult(nextResult);
      }
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to update router management endpoint.");
    }
  };

  return (
    <div id={anchorId}>
    <Card className="space-y-5">
      <CardHeader>
        <div>
          <CardTitle>RouterOS API access</CardTitle>
          <CardDescription>Manage authenticated RouterOS API credentials, verify live access, and review the last API health outcome for this router.</CardDescription>
        </div>
      </CardHeader>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.7fr)]">
        <Input label="API username" value={apiUsername} onChange={(event) => setApiUsername(event.target.value)} />
        <PasswordInput label={router.apiAccess.hasPassword ? "API password (leave blank to keep current)" : "API password"} value={apiPassword} onChange={(event) => setApiPassword(event.target.value)} />
        <Input label="API port" type="number" min="1" max="65535" value={apiPort} onChange={(event) => setApiPort(event.target.value)} />
      </div>

      <Input label="Reason" placeholder="Why are these credentials changing or being tested?" value={reason} onChange={(event) => setReason(event.target.value)} />

      {inlineError ? <InlineError message={inlineError} /> : null}

      <div className="grid gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">API health</p>
          <div className="mt-3">
            <StatusBadge state={router.apiAccess.state} />
          </div>
          <p className="mt-3 text-sm text-text-secondary">{router.apiAccess.lastError || "No RouterOS API error recorded."}</p>
        </div>
        <Metric label="Last success" value={formatDateTime(router.apiAccess.lastSuccessAt)} icon={<CheckCircle2 className="h-4 w-4 text-success" />} />
        <Metric label="Last failure" value={formatDateTime(router.apiAccess.lastErrorAt)} icon={<ShieldAlert className="h-4 w-4 text-danger" />} />
        <Metric label="RouterOS version" value={router.apiAccess.routerosVersion || "Unknown"} icon={<Network className="h-4 w-4 text-primary" />} />
      </div>

      {router.connectivity.endpointContract ? (
        <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-secondary">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Endpoint binding</p>
          <p className="mt-3 text-text-primary">{router.connectivity.endpointContract.state.replace(/_/g, " ")}</p>
          <p className="mt-2">Expected identity: <span className="text-text-primary">{router.connectivity.endpointContract.expectedIdentity || "Unknown"}</span></p>
          <p className="mt-1">Verified endpoint: <span className="font-mono text-text-primary">{router.connectivity.endpointContract.verifiedEndpointHost || "Not verified"}</span></p>
          {router.connectivity.endpointContract.mismatchReason ? <p className="mt-1 text-danger">{router.connectivity.endpointContract.mismatchReason}</p> : null}
        </div>
      ) : null}

      <div className={`rounded-2xl border p-4 ${mismatchState ? "border-danger/35 bg-danger/10" : "border-background-border bg-background-panel"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Rebind management endpoint</p>
            <p className="mt-2 text-sm text-text-secondary">
              Update the router host and expected identity, clear the mismatch quarantine, and optionally run a fresh RouterOS API validation.
            </p>
          </div>
          {mismatchState ? <span className="inline-flex rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-danger">Mismatch quarantined</span> : null}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.6fr)]">
          <Input label="Management host" placeholder="192.168.100.8 or router.example.com" value={managementHost} onChange={(event) => setManagementHost(event.target.value)} />
          <Input label="Expected identity" placeholder="RouterOS /system identity" value={hostname} onChange={(event) => setHostname(event.target.value)} />
          <Input label="SSH port" type="number" min="1" max="65535" value={sshPort} onChange={(event) => setSshPort(event.target.value)} />
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={() => void handleSaveAccess(false)} isLoading={setAccessMutation.isPending}>
            Save endpoint
          </Button>
          <Button onClick={() => void handleSaveAccess(true)} isLoading={setAccessMutation.isPending || testConnectionMutation.isPending} leftIcon={<PlugZap className="h-4 w-4" />}>
            Save endpoint and retest
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" onClick={() => void handleSave()} isLoading={setCredentialsMutation.isPending}>
          Save credentials
        </Button>
        <Button onClick={() => void handleTest()} isLoading={testConnectionMutation.isPending} leftIcon={<PlugZap className="h-4 w-4" />}>
          Test RouterOS API
        </Button>
      </div>

      {result ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-2xl border border-background-border bg-background-panel p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Connection result</p>
            <div className="mt-3 space-y-2 text-sm text-text-secondary">
              <p>Tested at: <span className="text-text-primary">{formatDateTime(result.testedAt)}</span></p>
              <p>Board: <span className="text-text-primary">{result.resource.boardName || "Unknown"}</span></p>
              <p>Platform: <span className="text-text-primary">{result.resource.platform || "Unknown"}</span></p>
              <p>Version: <span className="text-text-primary">{result.resource.version || "Unknown"}</span></p>
              <p>CPU load: <span className="text-text-primary">{result.resource.cpuLoad != null ? `${result.resource.cpuLoad}%` : "Unknown"}</span></p>
              <p>Uptime: <span className="text-text-primary">{result.resource.uptime || "Unknown"}</span></p>
            </div>
          </div>
          <div className="rounded-2xl border border-background-border bg-background-panel p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Interfaces discovered</p>
            <div className="mt-3 space-y-3">
              {result.interfaces.length ? result.interfaces.slice(0, 8).map((item) => (
                <div key={`${item.name}-${item.type}`} className="flex items-center justify-between gap-3 rounded-2xl border border-background-border bg-black/10 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-text-primary">{item.name}</p>
                    <p className="text-xs text-text-muted">{item.type}</p>
                  </div>
                  <span className={item.running && !item.disabled ? "text-success" : "text-text-secondary"}>
                    {item.disabled ? "disabled" : item.running ? "running" : "stopped"}
                  </span>
                </div>
              )) : <p className="text-sm text-text-muted">No interfaces were returned by RouterOS API.</p>}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-text-muted">Run a RouterOS API test to fetch live system resource and interface data.</p>
      )}
    </Card>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-background-border bg-background-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-sm text-text-primary">{value}</p>
    </div>
  );
}

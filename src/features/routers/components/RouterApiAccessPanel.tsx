import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, Network, PlugZap, ShieldAlert } from "lucide-react";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useSetRouterCredentials, useTestRouterConnection } from "@/features/routers/hooks/useRouter";
import type { RouterApiConnectionTest, RouterDetail } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

function StatusBadge({ state }: { state: RouterDetail["apiAccess"]["state"] }) {
  const styles = {
    healthy: "border-success/25 bg-success/10 text-success",
    failing: "border-danger/25 bg-danger/10 text-danger",
    pending: "border-warning/25 bg-warning/10 text-warning",
    unconfigured: "border-slate-500/20 bg-slate-500/10 text-slate-300",
  } as const;

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${styles[state]}`}>
      {state}
    </span>
  );
}

export function RouterApiAccessPanel({ router }: { router: RouterDetail }) {
  const setCredentialsMutation = useSetRouterCredentials();
  const testConnectionMutation = useTestRouterConnection();
  const [apiUsername, setApiUsername] = useState(router.apiAccess.username || "admin");
  const [apiPassword, setApiPassword] = useState("");
  const [apiPort, setApiPort] = useState(String(router.apiAccess.apiPort || 8728));
  const [reason, setReason] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [result, setResult] = useState<RouterApiConnectionTest | null>(null);

  useEffect(() => {
    setApiUsername(router.apiAccess.username || "admin");
    setApiPort(String(router.apiAccess.apiPort || 8728));
    setApiPassword("");
    setReason("");
  }, [router.apiAccess.apiPort, router.apiAccess.username, router.id]);

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

  return (
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
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">API health</p>
          <div className="mt-3">
            <StatusBadge state={router.apiAccess.state} />
          </div>
          <p className="mt-3 text-sm text-slate-400">{router.apiAccess.lastError || "No RouterOS API error recorded."}</p>
        </div>
        <Metric label="Last success" value={formatDateTime(router.apiAccess.lastSuccessAt)} icon={<CheckCircle2 className="h-4 w-4 text-success" />} />
        <Metric label="Last failure" value={formatDateTime(router.apiAccess.lastErrorAt)} icon={<ShieldAlert className="h-4 w-4 text-danger" />} />
        <Metric label="RouterOS version" value={router.apiAccess.routerosVersion || "Unknown"} icon={<Network className="h-4 w-4 text-brand-100" />} />
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
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Connection result</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>Tested at: <span className="text-slate-100">{formatDateTime(result.testedAt)}</span></p>
              <p>Board: <span className="text-slate-100">{result.resource.boardName || "Unknown"}</span></p>
              <p>Platform: <span className="text-slate-100">{result.resource.platform || "Unknown"}</span></p>
              <p>Version: <span className="text-slate-100">{result.resource.version || "Unknown"}</span></p>
              <p>CPU load: <span className="text-slate-100">{result.resource.cpuLoad != null ? `${result.resource.cpuLoad}%` : "Unknown"}</span></p>
              <p>Uptime: <span className="text-slate-100">{result.resource.uptime || "Unknown"}</span></p>
            </div>
          </div>
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Interfaces discovered</p>
            <div className="mt-3 space-y-3">
              {result.interfaces.length ? result.interfaces.slice(0, 8).map((item) => (
                <div key={`${item.name}-${item.type}`} className="flex items-center justify-between gap-3 rounded-2xl border border-brand-500/15 bg-black/10 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-100">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.type}</p>
                  </div>
                  <span className={item.running && !item.disabled ? "text-success" : "text-slate-400"}>
                    {item.disabled ? "disabled" : item.running ? "running" : "stopped"}
                  </span>
                </div>
              )) : <p className="text-sm text-slate-500">No interfaces were returned by RouterOS API.</p>}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Run a RouterOS API test to fetch live system resource and interface data.</p>
      )}
    </Card>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-sm text-slate-100">{value}</p>
    </div>
  );
}

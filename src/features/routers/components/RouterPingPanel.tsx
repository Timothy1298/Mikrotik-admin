import { useEffect, useMemo, useState } from "react";
import { Activity, CheckCircle2, CircleX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { usePingRouter } from "@/features/routers/hooks/useRouter";
import type { RouterDetail, RouterPingResult } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

export function RouterPingPanel({ router, anchorId }: { router: RouterDetail; anchorId?: string }) {
  const pingMutation = usePingRouter();
  const defaultTarget = router.profile.connectionMode === "management_only" ? "8.8.8.8" : "10.0.0.1";
  const [target, setTarget] = useState(defaultTarget);
  const [result, setResult] = useState<RouterPingResult | null>(router.pingHistory?.[0] || null);
  const history = useMemo(() => router.pingHistory || [], [router.pingHistory]);

  useEffect(() => {
    setResult((current) => current || router.pingHistory?.[0] || null);
  }, [router.pingHistory]);

  const handlePing = async () => {
    const nextResult = await pingMutation.mutateAsync({
      id: router.profile.id,
      payload: { address: target.trim() || defaultTarget, count: 4 },
    });
    setResult(nextResult);
  };

  return (
    <div id={anchorId}>
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Ping test</CardTitle>
          <CardDescription>
            {router.profile.connectionMode === "management_only"
              ? "Run a live reachability test from the router to any target IP or hostname using RouterOS API."
              : "Run a live reachability test from the router back to the WireGuard server."}
          </CardDescription>
        </div>
        <Button variant="outline" onClick={() => void handlePing()} disabled={pingMutation.isPending} leftIcon={pingMutation.isPending ? <Spinner className="h-4 w-4" /> : <Activity className="h-4 w-4" />}>
          {pingMutation.isPending ? "Testing" : "Run Ping Test"}
        </Button>
      </CardHeader>

      <Input
        label="Ping target"
        value={target}
        onChange={(event) => setTarget(event.target.value)}
        placeholder={defaultTarget}
        hint={router.profile.connectionMode === "management_only" ? "Example: 8.8.8.8 or your upstream gateway" : "Default WireGuard server address is 10.0.0.1"}
      />

      {!result ? (
        <p className="text-sm text-text-muted">No ping test has been run yet for this router.</p>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-background-border bg-background-panel p-4">
              <div className="flex items-center gap-2">
                {result.reachable ? <CheckCircle2 className="h-4 w-4 text-success" /> : <CircleX className="h-4 w-4 text-danger" />}
                <p className="text-sm font-medium text-text-primary">{result.reachable ? "Reachable" : "Unreachable"}</p>
              </div>
              <p className="mt-2 text-xs text-text-muted">Target: {result.target || target || defaultTarget}</p>
              <p className={`mt-2 text-xs ${result.reachable ? "text-success" : "text-danger"}`}>{result.error || (result.reachable ? "Router responded to ping." : "Router did not return a successful ping response.")}</p>
              <p className="mt-2 text-xs text-text-muted">{result.createdAt ? formatDateTime(result.createdAt) : "Just now"}</p>
            </div>
            <Metric label="Packets sent" value={result.packetsSent ?? "—"} />
            <Metric label="Packets received" value={result.packetsReceived ?? "—"} />
            <Metric label="Packet loss" value={result.packetLoss != null ? `${result.packetLoss}%` : "—"} />
            <Metric label="Avg RTT" value={result.avgRtt != null ? `${result.avgRtt} ms` : "—"} />
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Ping history</p>
            {history.length ? (
              <div className="grid gap-3">
                {history.map((entry, index) => (
                  <button
                    key={`${entry.createdAt || "entry"}-${index}`}
                    type="button"
                    onClick={() => setResult(entry)}
                    className="rounded-2xl border border-background-border bg-background-panel px-4 py-3 text-left transition hover:border-primary/40 hover:bg-primary/10"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{entry.target || defaultTarget}</p>
                        <p className="mt-1 text-xs text-text-muted">{entry.createdAt ? formatDateTime(entry.createdAt) : "Unknown time"}{entry.actor ? ` • ${entry.actor}` : ""}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${entry.reachable ? "text-success" : "text-danger"}`}>{entry.reachable ? "Reachable" : "Unreachable"}</p>
                        <p className="mt-1 text-xs text-text-muted">{entry.packetLoss != null ? `${entry.packetLoss}% loss` : "No loss data"}{entry.avgRtt != null ? ` • ${entry.avgRtt} ms` : ""}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No ping history has been recorded yet.</p>
            )}
          </div>
        </div>
      )}
    </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-background-border bg-background-panel p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{label}</p>
      <p className="mt-3 text-sm text-text-primary">{value}</p>
    </div>
  );
}

import { useState } from "react";
import { Activity, CheckCircle2, CircleX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { usePingRouter } from "@/features/routers/hooks/useRouter";
import type { RouterPingResult } from "@/features/routers/types/router.types";

export function RouterPingPanel({ routerId }: { routerId: string }) {
  const pingMutation = usePingRouter();
  const [result, setResult] = useState<RouterPingResult | null>(null);

  const handlePing = async () => {
    const nextResult = await pingMutation.mutateAsync(routerId);
    setResult(nextResult);
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Ping test</CardTitle>
          <CardDescription>Run a live reachability test from the router back to the WireGuard server.</CardDescription>
        </div>
        <Button variant="outline" onClick={() => void handlePing()} disabled={pingMutation.isPending} leftIcon={pingMutation.isPending ? <Spinner className="h-4 w-4" /> : <Activity className="h-4 w-4" />}>
          {pingMutation.isPending ? "Testing" : "Run Ping Test"}
        </Button>
      </CardHeader>

      {!result ? (
        <p className="text-sm text-slate-500">No ping test has been run yet for this router.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <div className="flex items-center gap-2">
              {result.reachable ? <CheckCircle2 className="h-4 w-4 text-success" /> : <CircleX className="h-4 w-4 text-danger" />}
              <p className="text-sm font-medium text-slate-100">{result.reachable ? "Reachable" : "Unreachable"}</p>
            </div>
            <p className={`mt-2 text-xs ${result.reachable ? "text-success" : "text-danger"}`}>{result.error || (result.reachable ? "Router responded to ping." : "Router did not return a successful ping response.")}</p>
          </div>
          <Metric label="Packets sent" value={result.packetsSent ?? "—"} />
          <Metric label="Packets received" value={result.packetsReceived ?? "—"} />
          <Metric label="Packet loss" value={result.packetLoss != null ? `${result.packetLoss}%` : "—"} />
          <Metric label="Avg RTT" value={result.avgRtt != null ? `${result.avgRtt} ms` : "—"} />
        </div>
      )}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-sm text-slate-100">{value}</p>
    </div>
  );
}

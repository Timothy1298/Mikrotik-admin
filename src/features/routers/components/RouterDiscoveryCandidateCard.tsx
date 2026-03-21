import { Cpu, EthernetPort, Router, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { RouterDiscoveryCandidate } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

export function RouterDiscoveryCandidateCard({
  candidate,
  selected,
  onSelect,
}: {
  candidate: RouterDiscoveryCandidate;
  selected: boolean;
  onSelect: () => void;
}) {
  const verification = candidate.verification;
  const statusTone =
    verification?.status === "imported" ? "info" :
    verification?.status === "verified" ? "success" :
    verification?.status === "duplicate" ? "danger" :
    candidate.isLikelyMikrotik ? "success" : "warning";

  return (
    <Card className={selected ? "border-primary/40 bg-primary/10" : "border-background-border"}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-text-primary">{candidate.ipAddress}</p>
            <Badge tone={statusTone as "success" | "warning" | "danger" | "info"}>
              {verification?.status || (candidate.isLikelyMikrotik ? "candidate" : "unknown")}
            </Badge>
            {candidate.isLikelyMikrotik ? <Badge tone="success">Likely MikroTik</Badge> : null}
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1"><Router className="h-3.5 w-3.5" /> Hostname: {candidate.hostname || "n/a"}</span>
            <span className="inline-flex items-center gap-1"><EthernetPort className="h-3.5 w-3.5" /> Ports: {candidate.openPorts.join(", ") || "none"}</span>
            <span className="inline-flex items-center gap-1"><Cpu className="h-3.5 w-3.5" /> Confidence: {(candidate.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(candidate.detectedServices || []).map((service) => <Badge key={service} tone="info">{service}</Badge>)}
            {verification?.method ? <Badge tone="info">Verified via {verification.method.toUpperCase()}</Badge> : null}
          </div>
          <p className="font-mono text-xs text-text-muted">
            Scanned {formatDateTime(candidate.scannedAt)}{candidate.subnet ? ` • ${candidate.subnet}` : ""}{candidate.macAddress ? ` • ${candidate.macAddress}` : ""}
          </p>
          {verification?.metadata?.identity ? (
            <p className="text-sm text-text-secondary">
              <ShieldCheck className="mr-1 inline h-4 w-4 text-primary" />
              Verified identity: {verification.metadata.identity}
            </p>
          ) : null}
        </div>
        <Button variant={selected ? "outline" : "ghost"} onClick={onSelect}>
          {selected ? "Selected" : "Select candidate"}
        </Button>
      </div>
    </Card>
  );
}

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Router } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { appRoutes } from "@/config/routes";
import type { VpnServerRouterItem } from "@/features/vpn-servers/types/vpn-server.types";

dayjs.extend(relativeTime);

export function VpnServerRoutersPanel({ items, loading, onRefresh }: { items: VpnServerRouterItem[]; loading?: boolean; onRefresh?: () => void }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Routers ({items.length})</CardTitle>
          <CardDescription>Routers currently assigned to this VPN server.</CardDescription>
        </div>
        <RefreshButton loading={loading} onClick={onRefresh} />
      </CardHeader>
      <div className="space-y-3">
        {loading ? <SectionLoader /> : items.length ? items.map((router) => {
          const statusTone = router.status === "active" ? "bg-success" : router.status === "pending" ? "bg-warning" : "bg-danger";
          const provisioningTone = router.provisioningState === "connected" ? "success" : router.provisioningState === "awaiting_connection" ? "warning" : router.provisioningState === "failed" ? "danger" : "neutral";
          return (
            <div key={router.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <Link className="text-sm font-medium text-text-primary transition hover:text-primary" to={appRoutes.routerDetail(router.id)}>
                    {router.name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                    <span className="inline-flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${statusTone}`} />
                      <span>{router.status}</span>
                    </span>
                    <Badge tone={provisioningTone}>{router.provisioningState.replace(/_/g, " ")}</Badge>
                    <span>{router.customer ? <Link className="transition hover:text-text-primary" to={appRoutes.userDetail(router.customer.id)}>{router.customer.name}</Link> : "No customer"}</span>
                  </div>
                  <p className="font-mono text-xs text-text-muted">{router.vpnIp}</p>
                </div>
                <p className="text-xs text-text-muted">{router.lastSeen ? dayjs(router.lastSeen).fromNow() : "No telemetry yet"}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { label: "Winbox", value: router.publicPorts.winbox ?? "-" },
                  { label: "SSH", value: router.publicPorts.ssh ?? "-" },
                  { label: "API", value: router.publicPorts.api ?? "-" },
                ].map((port) => (
                  <span key={port.label} className="rounded-xl border border-background-border bg-background-elevated px-3 py-1 text-xs text-text-secondary">
                    {port.label}: <span className="font-mono text-text-primary">{port.value}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        }) : <EmptyState icon={Router} title="No routers are currently attached to this VPN server" description="Assigned routers will appear here once they are provisioned against this server node." />}
      </div>
    </Card>
  );
}

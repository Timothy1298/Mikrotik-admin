import { Activity, AlertTriangle, Router, Server, WifiOff, Wrench } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import type { RouterDirectoryStats } from "@/features/routers/types/router.types";

export function RouterStatsRow({ stats }: { stats: RouterDirectoryStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Total routers" value={String(stats.totalRouters)} description="Managed MikroTik routers currently tracked in the control plane." icon={Router} tone="info" />
      <StatCard title="Online routers" value={String(stats.onlineRouters)} description="Routers with active connectivity and current tunnel health." icon={Activity} tone="success" />
      <StatCard title="Offline routers" value={String(stats.offlineRouters)} description="Routers currently disconnected or failing to report operational state." icon={WifiOff} tone="danger" />
      <StatCard title="Review pressure" value={String(stats.routersWithActiveAlerts)} description="Routers carrying active issues, diagnostics warnings, or manual review context." icon={AlertTriangle} tone="warning" />
      <StatCard title="Pending setup" value={String(stats.pendingSetupRouters)} description="Routers still inside setup, awaiting connection, or onboarding validation." icon={Wrench} tone="warning" />
      <StatCard title="Failed provisioning" value={String(stats.failedProvisioningRouters)} description="Routers where setup or provisioning state currently requires intervention." icon={AlertTriangle} tone="danger" />
      <StatCard title="Port mapping issues" value={String(stats.routersWithoutPorts)} description="Routers missing one or more public access mappings." icon={Wrench} tone="danger" />
      <StatCard title="Server nodes" value={String(Object.keys(stats.routersByServerNode || {}).length)} description="Distinct server assignments currently represented in the fleet." icon={Server} tone="neutral" />
    </div>
  );
}

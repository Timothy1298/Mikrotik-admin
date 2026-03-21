import { X } from "lucide-react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageLoader } from "@/components/feedback/PageLoader";
import { Button } from "@/components/ui/Button";
import { VpnServerDetailsWorkspace } from "@/features/vpn-servers/components/VpnServerDetailsWorkspace";
import type { VpnServerDetail, VpnServerPeerItem, VpnServerRouterItem, VpnServerTrafficDetail } from "@/features/vpn-servers/types/vpn-server.types";

export function VpnServerDetailsModal({
  open,
  loading,
  server,
  error,
  routers,
  peers,
  trafficDetail,
  routersLoading,
  peersLoading,
  onClose,
  ...workspaceProps
}: {
  open: boolean;
  loading?: boolean;
  server?: VpnServerDetail;
  error?: boolean;
  routers: VpnServerRouterItem[];
  peers: VpnServerPeerItem[];
  trafficDetail?: VpnServerTrafficDetail;
  routersLoading?: boolean;
  peersLoading?: boolean;
  onClose: () => void;
  onDisable: () => void;
  onReactivate: () => void;
  onEnableMaintenance: () => void;
  onClearMaintenance: () => void;
  onMigrateRouters: () => void;
  onRestartVpn: () => void;
  onReconcile: () => void;
  onRefreshRouters?: () => void;
  onRefreshPeers?: () => void;
  onMarkReviewed: () => void;
  onAddNote: () => void;
  onAddFlag: () => void;
  onRemoveFlag: (flag: VpnServerDetail["flags"][number]) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(15,23,42,0.85)] p-4 backdrop-blur-sm md:p-6">
      <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-background-border bg-background-panel">
        <div className="flex items-center justify-between gap-4 border-b border-background-border px-5 py-4 md:px-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">VPN server workspace</p>
            <h2 className="mt-2 text-2xl font-semibold text-text-primary">{server?.profile.name || "Loading VPN server details"}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">
          {loading ? <PageLoader /> : error || !server ? <ErrorState title="Unable to load VPN server details" description="The VPN server workspace could not be loaded. Retry after checking the admin VPN server API." /> : <VpnServerDetailsWorkspace server={server} routers={routers} peers={peers} trafficDetail={trafficDetail} routersLoading={routersLoading} peersLoading={peersLoading} showRouteLink {...workspaceProps} />}
        </div>
      </div>
    </div>
  );
}

import { VpnServerActionDialog } from "@/features/vpn-servers/components/VpnServerActionDialog";

export function ReconcileVpnServerDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <VpnServerActionDialog {...props} title="Reconcile VPN peers" description="Trigger peer reconciliation for this server if the backend control plane supports it." confirmLabel="Reconcile server" />;
}

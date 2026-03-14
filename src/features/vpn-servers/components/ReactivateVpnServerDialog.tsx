import { VpnServerActionDialog } from "@/features/vpn-servers/components/VpnServerActionDialog";

export function ReactivateVpnServerDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <VpnServerActionDialog {...props} title="Reactivate VPN server" description="Restore this server to the active fleet and resume normal health evaluation." confirmLabel="Reactivate server" />;
}

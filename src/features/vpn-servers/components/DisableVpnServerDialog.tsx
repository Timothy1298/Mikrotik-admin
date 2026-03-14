import { VpnServerActionDialog } from "@/features/vpn-servers/components/VpnServerActionDialog";

export function DisableVpnServerDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <VpnServerActionDialog {...props} title="Disable VPN server" description="Disable this server node. The backend will block the action if active router assignments still make it unsafe." confirmLabel="Disable server" confirmVariant="danger" requireReason />;
}

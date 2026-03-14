import { VpnServerActionDialog } from "@/features/vpn-servers/components/VpnServerActionDialog";

export function RestartVpnDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <VpnServerActionDialog {...props} title="Restart VPN service" description="Trigger a WireGuard restart for this server if the current control mode supports it." confirmLabel="Restart VPN" requireReason />;
}

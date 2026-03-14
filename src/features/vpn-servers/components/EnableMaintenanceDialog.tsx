import { VpnServerActionDialog } from "@/features/vpn-servers/components/VpnServerActionDialog";

export function EnableMaintenanceDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <VpnServerActionDialog {...props} title="Enter maintenance mode" description="Place this server in maintenance mode while you perform infrastructure work or staged review." confirmLabel="Enable maintenance" />;
}

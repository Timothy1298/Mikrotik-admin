import { VpnServerActionDialog } from "@/features/vpn-servers/components/VpnServerActionDialog";

export function ClearMaintenanceDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <VpnServerActionDialog {...props} title="Clear maintenance mode" description="Return this server to its normal operational lifecycle and resume standard status evaluation." confirmLabel="Clear maintenance" />;
}

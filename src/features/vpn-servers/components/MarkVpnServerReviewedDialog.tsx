import { VpnServerActionDialog } from "@/features/vpn-servers/components/VpnServerActionDialog";

export function MarkVpnServerReviewedDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <VpnServerActionDialog {...props} title="Mark server reviewed" description="Mark the current server issue and diagnostics context as reviewed." confirmLabel="Mark reviewed" />;
}

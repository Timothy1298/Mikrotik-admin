import { VpnServerActionDialog } from "@/features/vpn-servers/components/VpnServerActionDialog";

export function RemoveServerFlagDialog({
  open,
  loading,
  flag,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  flag: { flag: string; severity: string } | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  return <VpnServerActionDialog open={open} title="Remove server flag" description={flag ? `Remove the ${flag.flag} flag from this server.` : "Remove the selected server flag."} confirmLabel="Remove flag" confirmVariant="danger" loading={loading} onClose={onClose} onConfirm={onConfirm} />;
}

import { RouterActionDialog } from "@/features/routers/components/RouterActionDialog";

export function RemoveRouterFlagDialog({
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
  return (
    <RouterActionDialog
      open={open}
      title="Remove router flag"
      description={flag ? `Remove the ${flag.flag} flag from this router.` : "Remove the selected router flag."}
      confirmLabel="Remove flag"
      confirmVariant="danger"
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

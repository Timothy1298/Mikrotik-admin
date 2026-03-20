import { RouterActionDialog } from "@/features/routers/components/RouterActionDialog";

export function RebootRouterDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return (
    <RouterActionDialog
      {...props}
      title="Reboot router"
      description="This will restart the live MikroTik device and briefly disconnect active clients using this router."
      confirmLabel="Send reboot command"
      confirmVariant="outline"
      reasonLabel="Reboot reason"
      reasonPlaceholder="Optional maintenance or incident reason"
    />
  );
}

import { RouterActionDialog } from "@/features/routers/components/RouterActionDialog";

export function DeleteRouterDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return (
    <RouterActionDialog
      {...props}
      title="Delete router"
      description="Permanently delete this router, remove its linked peer, stop public access proxies, and release its assigned ports."
      confirmLabel="Delete router"
      confirmVariant="danger"
      requireReason
      reasonPlaceholder="Why is this router being deleted?"
    />
  );
}

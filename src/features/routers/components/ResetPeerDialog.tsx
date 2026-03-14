import { RouterActionDialog } from "@/features/routers/components/RouterActionDialog";

export function ResetPeerDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <RouterActionDialog {...props} title="Reset router peer" description="Rotate the router WireGuard peer material and generate fresh setup artifacts for reconnection." confirmLabel="Reset peer" requireReason />;
}

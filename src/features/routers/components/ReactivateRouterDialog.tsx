import { RouterActionDialog } from "@/features/routers/components/RouterActionDialog";

export function ReactivateRouterDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <RouterActionDialog {...props} title="Reactivate router" description="Restore router connectivity management, re-enable the peer, and restart router proxy services." confirmLabel="Reactivate router" />;
}

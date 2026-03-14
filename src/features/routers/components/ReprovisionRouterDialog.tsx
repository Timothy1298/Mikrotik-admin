import { RouterActionDialog } from "@/features/routers/components/RouterActionDialog";

export function ReprovisionRouterDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <RouterActionDialog {...props} title="Reprovision router" description="Recreate the router provisioning state, confirm peer attachment, and refresh runtime resources." confirmLabel="Reprovision router" />;
}

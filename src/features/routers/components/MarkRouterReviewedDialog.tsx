import { RouterActionDialog } from "@/features/routers/components/RouterActionDialog";

export function MarkRouterReviewedDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <RouterActionDialog {...props} title="Mark router reviewed" description="Mark the router provisioning and diagnostics context as reviewed for the current investigation cycle." confirmLabel="Mark reviewed" />;
}

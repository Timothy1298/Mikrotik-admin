import { RouterActionDialog } from "@/features/routers/components/RouterActionDialog";

export function DisableRouterDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <RouterActionDialog {...props} title="Disable router" description="Disable the router, stop its peer, and shut down its public access proxies." confirmLabel="Disable router" confirmVariant="danger" requireReason />;
}

import { RouterActionDialog } from "@/features/routers/components/RouterActionDialog";

export function RegenerateSetupDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <RouterActionDialog {...props} title="Regenerate setup" description="Generate fresh setup artifacts for the router without changing the current assignment state." confirmLabel="Regenerate setup" />;
}

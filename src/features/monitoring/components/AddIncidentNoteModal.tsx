import { MonitoringActionDialog } from "@/features/monitoring/components/MonitoringActionDialog";

export function AddIncidentNoteModal(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (payload: { body: string; category: string; reason?: string }) => void }) {
  return <MonitoringActionDialog open={props.open} loading={props.loading} requireBody title="Add incident note" description="Capture investigation context, follow-up instructions, or resolution detail for this incident." confirmLabel="Add note" onClose={props.onClose} onConfirm={(payload) => props.onConfirm({ body: payload.body || "", category: "incident", reason: payload.reason })} />;
}

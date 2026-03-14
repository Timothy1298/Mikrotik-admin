import { MonitoringActionDialog } from "@/features/monitoring/components/MonitoringActionDialog";

export function AcknowledgeIncidentModal(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason?: string) => void }) {
  return <MonitoringActionDialog open={props.open} loading={props.loading} title="Acknowledge incident" description="Confirm that an operator has taken ownership of this incident." confirmLabel="Acknowledge" onClose={props.onClose} onConfirm={(payload) => props.onConfirm(payload.reason)} />;
}

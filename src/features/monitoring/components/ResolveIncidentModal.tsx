import { MonitoringActionDialog } from "@/features/monitoring/components/MonitoringActionDialog";

export function ResolveIncidentModal(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason?: string) => void }) {
  return <MonitoringActionDialog open={props.open} loading={props.loading} title="Resolve incident" description="Mark this incident as resolved after confirming the operational issue is cleared." confirmLabel="Resolve" onClose={props.onClose} onConfirm={(payload) => props.onConfirm(payload.reason)} />;
}

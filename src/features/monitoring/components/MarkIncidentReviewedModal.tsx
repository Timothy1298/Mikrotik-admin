import { MonitoringActionDialog } from "@/features/monitoring/components/MonitoringActionDialog";

export function MarkIncidentReviewedModal(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason?: string) => void }) {
  return <MonitoringActionDialog open={props.open} loading={props.loading} title="Mark incident reviewed" description="Record that this incident has been manually reviewed by operations or support." confirmLabel="Mark reviewed" onClose={props.onClose} onConfirm={(payload) => props.onConfirm(payload.reason)} />;
}

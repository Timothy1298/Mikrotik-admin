import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function ConfirmDeleteModal(props: { open: boolean; resourceName: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <ConfirmDialog
      open={props.open}
      title={`Delete ${props.resourceName}`}
      description="This action cannot be undone. Review dependencies before removing it from the control plane."
      confirmLabel="Delete"
      onClose={props.onClose}
      onConfirm={props.onConfirm}
    />
  );
}

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type BackupForm = {
  note: string;
};

export function CreateBackupDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}) {
  const { register, handleSubmit, reset } = useForm<BackupForm>({
    defaultValues: { note: "" },
  });

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Create backup"
      description="Capture the current RouterOS export for this router and store it for later review or download."
      maxWidthClass="max-w-2xl"
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) => onConfirm(values.note.trim()))}
      >
        <Input
          label="Note"
          placeholder="Optional reason for this backup"
          {...register("note")}
        />
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Create backup now
          </Button>
        </div>
      </form>
    </Modal>
  );
}

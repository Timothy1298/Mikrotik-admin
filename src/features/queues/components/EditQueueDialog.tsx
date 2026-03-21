import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import type { QueuePayload, RouterQueue } from "@/features/queues/types/queue.types";

type QueueForm = {
  name: string;
  target: string;
  downloadValue: number;
  downloadUnit: "kbps" | "Mbps";
  uploadValue: number;
  uploadUnit: "kbps" | "Mbps";
  comment: string;
};

function fromKbps(kbps: number) {
  if (kbps >= 1000) return { value: kbps / 1000, unit: "Mbps" as const };
  return { value: kbps, unit: "kbps" as const };
}

function toKbps(value: number, unit: "kbps" | "Mbps") {
  return unit === "Mbps" ? Math.round(value * 1000) : Math.round(value);
}

export function EditQueueDialog({
  open,
  queue,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  queue: RouterQueue | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: Partial<QueuePayload>) => void;
}) {
  const { register, handleSubmit, reset, watch } = useForm<QueueForm>({
    defaultValues: {
      name: "",
      target: "",
      downloadValue: 0,
      downloadUnit: "Mbps",
      uploadValue: 0,
      uploadUnit: "Mbps",
      comment: "",
    },
  });

  useEffect(() => {
    if (!queue) return;
    const down = fromKbps(queue.maxDownloadKbps || 0);
    const up = fromKbps(queue.maxUploadKbps || 0);
    reset({
      name: queue.name,
      target: queue.target,
      downloadValue: down.value,
      downloadUnit: down.unit,
      uploadValue: up.value,
      uploadUnit: up.unit,
      comment: queue.comment || "",
    });
  }, [queue, reset]);

  return (
    <Modal open={open} onClose={onClose} title="Edit queue" description="Update queue name, target, or enforced bandwidth limits.">
      <form className="space-y-4" onSubmit={handleSubmit((values) => onConfirm({
        name: values.name.trim(),
        target: values.target.trim(),
        maxDownloadKbps: toKbps(values.downloadValue, values.downloadUnit),
        maxUploadKbps: toKbps(values.uploadValue, values.uploadUnit),
        comment: values.comment || "",
      }))}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Name" {...register("name")} />
          <Input label="Target IP/CIDR" {...register("target")} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid grid-cols-[minmax(0,1fr)_180px] gap-3">
            <Input label="Download limit" type="number" min="0" {...register("downloadValue", { valueAsNumber: true })} />
            <Select label="Unit" options={[{ label: "kbps", value: "kbps" }, { label: "Mbps", value: "Mbps" }]} value={watch("downloadUnit")} {...register("downloadUnit")} />
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_180px] gap-3">
            <Input label="Upload limit" type="number" min="0" {...register("uploadValue", { valueAsNumber: true })} />
            <Select label="Unit" options={[{ label: "kbps", value: "kbps" }, { label: "Mbps", value: "Mbps" }]} value={watch("uploadUnit")} {...register("uploadUnit")} />
          </div>
        </div>
        <Input label="Comment" {...register("comment")} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={loading} disabled={!queue}>Save changes</Button>
        </div>
      </form>
    </Modal>
  );
}

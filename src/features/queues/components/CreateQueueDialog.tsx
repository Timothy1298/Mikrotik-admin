import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import type { QueuePayload } from "@/features/queues/types/queue.types";

type QueueForm = {
  name: string;
  target: string;
  downloadValue: number;
  downloadUnit: "kbps" | "Mbps";
  uploadValue: number;
  uploadUnit: "kbps" | "Mbps";
  queueType: "simple" | "pcq";
  pcqDownloadProfile: string;
  pcqUploadProfile: string;
  comment: string;
};

function toKbps(value: number, unit: "kbps" | "Mbps") {
  return unit === "Mbps" ? Math.round(value * 1000) : Math.round(value);
}

function isTargetValid(target: string) {
  return /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(target.trim());
}

export function CreateQueueDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: QueuePayload) => void;
}) {
  const { register, handleSubmit, reset, watch, setError, formState: { errors } } = useForm<QueueForm>({
    defaultValues: {
      name: "",
      target: "",
      downloadValue: 10,
      downloadUnit: "Mbps",
      uploadValue: 5,
      uploadUnit: "Mbps",
      queueType: "simple",
      pcqDownloadProfile: "",
      pcqUploadProfile: "",
      comment: "",
    },
  });
  const queueType = watch("queueType");

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Create queue" description="Create a manual simple queue for a specific target IP or CIDR on this router.">
      <form className="space-y-4" onSubmit={handleSubmit((values) => {
        if (!isTargetValid(values.target)) {
          setError("target", { message: "Enter a valid IP address or CIDR target" });
          return;
        }
        if (values.queueType === "pcq" && !values.pcqDownloadProfile.trim() && !values.pcqUploadProfile.trim()) {
          setError("pcqDownloadProfile", { message: "Set at least one PCQ profile" });
          return;
        }
        onConfirm({
          name: values.name.trim(),
          target: values.target.trim(),
          maxDownloadKbps: toKbps(values.downloadValue, values.downloadUnit),
          maxUploadKbps: toKbps(values.uploadValue, values.uploadUnit),
          queueType: values.queueType,
          pcqDownloadProfile: values.queueType === "pcq" ? values.pcqDownloadProfile.trim() : "",
          pcqUploadProfile: values.queueType === "pcq" ? values.pcqUploadProfile.trim() : "",
          comment: values.comment || "",
        });
      })}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Name" error={errors.name?.message} {...register("name", { required: "Queue name is required" })} />
          <Input label="Target IP/CIDR" error={errors.target?.message} {...register("target", { required: "Target IP is required" })} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Select
            label="Queue type"
            options={[{ label: "Simple", value: "simple" }, { label: "PCQ", value: "pcq" }]}
            value={queueType}
            {...register("queueType")}
          />
          <Input
            label="PCQ download profile"
            placeholder="pcq-download-default"
            disabled={queueType !== "pcq"}
            error={errors.pcqDownloadProfile?.message}
            {...register("pcqDownloadProfile")}
          />
          <Input
            label="PCQ upload profile"
            placeholder="pcq-upload-default"
            disabled={queueType !== "pcq"}
            {...register("pcqUploadProfile")}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid grid-cols-[minmax(0,1fr)_180px] gap-3">
            <Input label="Download limit" type="number" min="0" error={errors.downloadValue?.message} {...register("downloadValue", { valueAsNumber: true })} />
            <Select label="Unit" options={[{ label: "kbps", value: "kbps" }, { label: "Mbps", value: "Mbps" }]} value={watch("downloadUnit")} {...register("downloadUnit")} />
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_180px] gap-3">
            <Input label="Upload limit" type="number" min="0" error={errors.uploadValue?.message} {...register("uploadValue", { valueAsNumber: true })} />
            <Select label="Unit" options={[{ label: "kbps", value: "kbps" }, { label: "Mbps", value: "Mbps" }]} value={watch("uploadUnit")} {...register("uploadUnit")} />
          </div>
        </div>
        <Input label="Comment" error={errors.comment?.message} {...register("comment")} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" isLoading={loading}>Create queue</Button>
        </div>
      </form>
    </Modal>
  );
}

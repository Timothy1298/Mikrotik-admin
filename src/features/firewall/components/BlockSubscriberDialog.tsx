import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import type { BlockSubscriberPayload } from "@/features/firewall/types/firewall.types";

type FormValues = {
  ipAddress: string;
  reason: string;
};

export function BlockSubscriberDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: BlockSubscriberPayload) => void;
}) {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      ipAddress: "",
      reason: "",
    },
  });

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Block subscriber" description="Add this subscriber IP to the router's blocked address list for billing or abuse enforcement.">
      <form className="space-y-4" onSubmit={handleSubmit((values) => onConfirm({
        ipAddress: values.ipAddress.trim(),
        reason: values.reason.trim(),
      }))}>
        <Input label="IP Address" placeholder="192.168.100.9" {...register("ipAddress", { required: true })} />
        <Textarea label="Reason" placeholder="Unpaid subscription for March cycle" {...register("reason")} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" variant="danger" isLoading={loading}>Block subscriber</Button>
        </div>
      </form>
    </Modal>
  );
}

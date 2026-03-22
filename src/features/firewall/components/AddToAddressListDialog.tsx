import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { AddressListPayload } from "@/features/firewall/types/firewall.types";

type FormValues = {
  list: string;
  address: string;
  comment: string;
};

export function AddToAddressListDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: AddressListPayload) => void;
}) {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      list: "",
      address: "",
      comment: "",
    },
  });

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Add address list entry" description="Append an IP or subnet to a firewall address list on this router.">
      <form className="space-y-4" onSubmit={handleSubmit((values) => onConfirm({
        list: values.list.trim(),
        address: values.address.trim(),
        comment: values.comment.trim(),
      }))}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="List" placeholder="blocked" {...register("list", { required: true })} />
          <Input label="Address" placeholder="192.168.100.9" {...register("address", { required: true })} />
        </div>
        <Input label="Comment" {...register("comment")} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" isLoading={loading}>Add entry</Button>
        </div>
      </form>
    </Modal>
  );
}

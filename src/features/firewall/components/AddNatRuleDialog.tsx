import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import type { NatRule, NatRulePayload } from "@/features/firewall/types/firewall.types";

type FormValues = {
  chain: string;
  action: string;
  protocol: string;
  dstPort: string;
  toAddresses: string;
  toPorts: string;
  comment: string;
};

export function AddNatRuleDialog({
  open,
  loading,
  initialRule,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  initialRule?: NatRule | null;
  onClose: () => void;
  onConfirm: (payload: NatRulePayload) => void;
}) {
  const { register, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: {
      chain: "dstnat",
      action: "dst-nat",
      protocol: "tcp",
      dstPort: "",
      toAddresses: "",
      toPorts: "",
      comment: "",
    },
  });

  const title = initialRule ? "Edit NAT rule" : "Add NAT rule";
  const submitLabel = initialRule ? "Save changes" : "Add rule";

  useEffect(() => {
    if (!open) return;
    reset({
      chain: initialRule?.chain || "dstnat",
      action: initialRule?.action || "dst-nat",
      protocol: initialRule?.protocol || "tcp",
      dstPort: initialRule?.dstPort || "",
      toAddresses: initialRule?.toAddresses || "",
      toPorts: initialRule?.toPorts || "",
      comment: initialRule?.comment || "",
    });
  }, [initialRule, open, reset]);

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={title} description="Create source NAT or destination NAT rules on this router.">
      <form className="space-y-4" onSubmit={handleSubmit((values) => onConfirm({
        chain: values.chain,
        action: values.action,
        protocol: values.protocol === "any" ? "" : values.protocol,
        dstPort: values.dstPort.trim(),
        toAddresses: values.toAddresses.trim(),
        toPorts: values.toPorts.trim(),
        comment: values.comment.trim(),
      }))}>
        <div className="grid gap-4 md:grid-cols-3">
          <Select label="Chain" options={[{ label: "srcnat", value: "srcnat" }, { label: "dstnat", value: "dstnat" }]} value={watch("chain")} {...register("chain")} />
          <Select label="Action" options={[{ label: "masquerade", value: "masquerade" }, { label: "dst-nat", value: "dst-nat" }, { label: "src-nat", value: "src-nat" }]} value={watch("action")} {...register("action")} />
          <Select label="Protocol" options={[{ label: "Any", value: "any" }, { label: "TCP", value: "tcp" }, { label: "UDP", value: "udp" }]} value={watch("protocol")} {...register("protocol")} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Dst Port" placeholder="8291" {...register("dstPort")} />
          <Input label="To Addresses" placeholder="192.168.88.2" {...register("toAddresses")} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="To Ports" placeholder="22" {...register("toPorts")} />
          <Input label="Comment" {...register("comment")} />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" isLoading={loading}>{submitLabel}</Button>
        </div>
      </form>
    </Modal>
  );
}

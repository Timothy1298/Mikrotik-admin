import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import type { FilterRule, FilterRulePayload } from "@/features/firewall/types/firewall.types";

type FormValues = {
  chain: string;
  action: string;
  protocol: string;
  srcAddress: string;
  dstAddress: string;
  dstPort: string;
  inInterface: string;
  comment: string;
};

export function AddFilterRuleDialog({
  open,
  loading,
  initialRule,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  initialRule?: FilterRule | null;
  onClose: () => void;
  onConfirm: (payload: FilterRulePayload) => void;
}) {
  const { register, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: {
      chain: "forward",
      action: "accept",
      protocol: "any",
      srcAddress: "",
      dstAddress: "",
      dstPort: "",
      inInterface: "",
      comment: "",
    },
  });

  useEffect(() => {
    if (!initialRule) return;
    reset({
      chain: initialRule.chain || "forward",
      action: initialRule.action || "accept",
      protocol: initialRule.protocol || "any",
      srcAddress: initialRule.srcAddress || "",
      dstAddress: initialRule.dstAddress || "",
      dstPort: initialRule.dstPort || "",
      inInterface: initialRule.inInterface || "",
      comment: initialRule.comment || "",
    });
  }, [initialRule, reset]);

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title={initialRule ? "Edit filter rule" : "Add filter rule"}
      description="Create or update input, forward, or output rules on the router firewall."
    >
      <form className="space-y-4" onSubmit={handleSubmit((values) => onConfirm({
        chain: values.chain,
        action: values.action,
        protocol: values.protocol === "any" ? "" : values.protocol,
        srcAddress: values.srcAddress.trim(),
        dstAddress: values.dstAddress.trim(),
        dstPort: values.dstPort.trim(),
        inInterface: values.inInterface.trim(),
        comment: values.comment.trim(),
      }))}>
        <div className="grid gap-4 md:grid-cols-3">
          <Select label="Chain" options={[{ label: "Input", value: "input" }, { label: "Forward", value: "forward" }, { label: "Output", value: "output" }]} value={watch("chain")} {...register("chain")} />
          <Select label="Action" options={[{ label: "Accept", value: "accept" }, { label: "Drop", value: "drop" }, { label: "Reject", value: "reject" }, { label: "Log", value: "log" }]} value={watch("action")} {...register("action")} />
          <Select label="Protocol" options={[{ label: "Any", value: "any" }, { label: "TCP", value: "tcp" }, { label: "UDP", value: "udp" }, { label: "ICMP", value: "icmp" }]} value={watch("protocol")} {...register("protocol")} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Src Address" placeholder="192.168.1.0/24" {...register("srcAddress")} />
          <Input label="Dst Address" placeholder="10.0.0.0/24" {...register("dstAddress")} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Dst Port" placeholder="80,443" {...register("dstPort")} />
          <Input label="Interface" placeholder="ether1" {...register("inInterface")} />
        </div>
        <Input label="Comment" {...register("comment")} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" isLoading={loading}>{initialRule ? "Save changes" : "Add rule"}</Button>
        </div>
      </form>
    </Modal>
  );
}

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useServicePlans } from "@/features/service-plans/hooks/useServicePlans";
import type { ApplyPlanPayload } from "@/features/queues/types/queue.types";

type ApplyPlanForm = {
  subscriberIp: string;
  servicePlanId: string;
  subscriptionId: string;
};

export function ApplyPlanDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: ApplyPlanPayload) => void;
}) {
  const plansQuery = useServicePlans({ isActive: "true" });
  const plans = plansQuery.data || [];
  const options = useMemo(() => plans.map((plan) => ({ label: `${plan.name} (${(plan.speedDownloadKbps / 1000).toFixed(1)}/${(plan.speedUploadKbps / 1000).toFixed(1)} Mbps)`, value: plan.id })), [plans]);
  const { register, handleSubmit, watch, reset } = useForm<ApplyPlanForm>({
    defaultValues: {
      subscriberIp: "",
      servicePlanId: options[0]?.value || "",
      subscriptionId: "",
    },
  });

  const selectedPlan = plans.find((plan) => plan.id === watch("servicePlanId"));

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Apply service plan" description="Bind an existing service plan to a subscriber IP and enforce its bandwidth queue on this router.">
      <form className="space-y-4" onSubmit={handleSubmit((values) => onConfirm({
        subscriberIp: values.subscriberIp.trim(),
        servicePlanId: values.servicePlanId,
        subscriptionId: values.subscriptionId.trim() || undefined,
      }))}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Subscriber IP" placeholder="10.0.0.15/32" {...register("subscriberIp", { required: true })} />
          <Select label="Service plan" options={options.length ? options : [{ label: "No active plans", value: "" }]} value={watch("servicePlanId")} {...register("servicePlanId")} />
        </div>
        <Input label="Linked subscription ID (optional)" placeholder="Subscription document id" {...register("subscriptionId")} />
        {selectedPlan ? (
          <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-secondary">
            <p className="font-medium text-text-primary">{selectedPlan.name}</p>
            <p className="mt-2">Download: {(selectedPlan.speedDownloadKbps / 1000).toFixed(1)} Mbps</p>
            <p>Upload: {(selectedPlan.speedUploadKbps / 1000).toFixed(1)} Mbps</p>
            <p>Price: {selectedPlan.currency} {selectedPlan.price.toFixed(2)}</p>
          </div>
        ) : null}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" isLoading={loading} disabled={!watch("servicePlanId")}>Apply plan</Button>
        </div>
      </form>
    </Modal>
  );
}

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { VoucherPrintPreview } from "@/features/hotspot/components/VoucherPrintPreview";
import { voucherGenerationSchema, type VoucherGenerationSchema } from "@/features/hotspot/schemas/hotspot.schema";
import type { GenerateVouchersPayload, HotspotProfile } from "@/features/hotspot/types/hotspot.types";

function toPayload(values: VoucherGenerationSchema): GenerateVouchersPayload {
  return {
    count: values.count,
    prefix: values.prefix || undefined,
    profile: values.profile,
    dataLimitBytes: values.dataLimitUnit === "unlimited" ? 0 : values.dataLimitValue * (values.dataLimitUnit === "GB" ? 1024 ** 3 : 1024 ** 2),
    timeLimitSeconds: values.timeLimitUnit === "unlimited" ? 0 : values.timeLimitValue * (values.timeLimitUnit === "days" ? 86400 : 3600),
    expiresAt: values.expiresAt || null,
  };
}

export function GenerateVouchersDialog({
  open,
  loading,
  profiles,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  profiles: HotspotProfile[];
  onClose: () => void;
  onConfirm: (payload: GenerateVouchersPayload) => Promise<Array<{ username: string; password: string }>>;
}) {
  const [generated, setGenerated] = useState<Array<{ username: string; password: string }>>([]);
  const profileOptions = useMemo(() => (profiles.length ? profiles : [{ name: "default", rateLimit: "", sessionTimeout: "", idleTimeout: "" }]).map((profile) => ({ label: profile.name, value: profile.name })), [profiles]);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<VoucherGenerationSchema>({
    resolver: zodResolver(voucherGenerationSchema),
    defaultValues: {
      count: 10,
      prefix: "HS",
      profile: profileOptions[0]?.value || "default",
      dataLimitValue: 0,
      dataLimitUnit: "unlimited",
      timeLimitValue: 0,
      timeLimitUnit: "unlimited",
      expiresAt: "",
    },
  });

  const submit = handleSubmit(async (values) => {
    const vouchers = await onConfirm(toPayload(values));
    setGenerated(vouchers);
  });

  return (
    <Modal open={open} onClose={() => { setGenerated([]); reset(); onClose(); }} title="Generate hotspot vouchers" description="Create batches of hotspot usernames and passwords for print or desk distribution." maxWidthClass="max-w-[min(98vw,88rem)]">
      {generated.length ? (
        <VoucherPrintPreview vouchers={generated} />
      ) : (
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Count" type="number" min="1" max="100" error={errors.count?.message} {...register("count")} />
            <Input label="Prefix" error={errors.prefix?.message} {...register("prefix")} />
            <Select label="Profile" options={profileOptions} value={watch("profile")} {...register("profile")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid grid-cols-[minmax(0,1fr)_180px] gap-3">
              <Input label="Data limit" type="number" min="0" error={errors.dataLimitValue?.message} {...register("dataLimitValue")} />
              <Select label="Unit" options={[{ label: "Unlimited", value: "unlimited" }, { label: "MB", value: "MB" }, { label: "GB", value: "GB" }]} value={watch("dataLimitUnit")} {...register("dataLimitUnit")} />
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_180px] gap-3">
              <Input label="Time limit" type="number" min="0" error={errors.timeLimitValue?.message} {...register("timeLimitValue")} />
              <Select label="Unit" options={[{ label: "Unlimited", value: "unlimited" }, { label: "Hours", value: "hours" }, { label: "Days", value: "days" }]} value={watch("timeLimitUnit")} {...register("timeLimitUnit")} />
            </div>
          </div>
          <Input label="Expires at" type="date" error={errors.expiresAt?.message as string | undefined} {...register("expiresAt")} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => { setGenerated([]); reset(); onClose(); }}>Cancel</Button>
            <Button type="submit" isLoading={loading}>Generate vouchers</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

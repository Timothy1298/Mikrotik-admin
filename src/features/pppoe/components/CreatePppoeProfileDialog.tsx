import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { pppoeProfileSchema, type PppoeProfileSchema } from "@/features/pppoe/schemas/pppoe.schema";
import type { PppoeProfile, PppoeProfileOption, PppoeProfilePayload } from "@/features/pppoe/types/pppoe.types";

const PPPOE_PROFILE_TEMPLATES = [
  { label: "Custom", value: "custom", name: "", rateLimit: "", localAddress: "", remoteAddress: "", comment: "" },
  { label: "Starter", value: "starter", name: "starter", rateLimit: "10M/5M", localAddress: "pool-starter-local", remoteAddress: "pool-starter-remote", comment: "Starter PPPoE access profile" },
  { label: "Business", value: "business", name: "business", rateLimit: "20M/10M", localAddress: "pool-business-local", remoteAddress: "pool-business-remote", comment: "Business PPPoE access profile" },
  { label: "Premium", value: "premium", name: "premium", rateLimit: "50M/20M", localAddress: "pool-premium-local", remoteAddress: "pool-premium-remote", comment: "Premium PPPoE access profile" },
];

export function CreatePppoeProfileDialog({
  open,
  loading,
  initialProfile,
  existingProfiles = [],
  localAddressOptions = [],
  remoteAddressOptions = [],
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  initialProfile?: PppoeProfile | null;
  existingProfiles?: PppoeProfile[];
  localAddressOptions?: PppoeProfileOption[];
  remoteAddressOptions?: PppoeProfileOption[];
  onClose: () => void;
  onConfirm: (payload: PppoeProfilePayload) => void;
}) {
  const cloneOptions = useMemo(
    () => [{ label: "None", value: "" }, ...existingProfiles.map((item) => ({ label: `${item.name}${item.rateLimit ? ` • ${item.rateLimit}` : ""}`, value: item.id || item.name }))],
    [existingProfiles]
  );
  const localOptions = useMemo(
    () => [{ label: "Custom / leave blank", value: "" }, ...localAddressOptions.map((item: PppoeProfileOption) => ({ label: item.label, value: item.value }))],
    [localAddressOptions]
  );
  const remoteOptions = useMemo(
    () => [{ label: "Custom / leave blank", value: "" }, ...remoteAddressOptions.map((item: PppoeProfileOption) => ({ label: item.label, value: item.value }))],
    [remoteAddressOptions]
  );
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PppoeProfileSchema & { template: string; cloneFrom: string }>({
    resolver: zodResolver(pppoeProfileSchema),
    defaultValues: {
      template: "custom",
      cloneFrom: "",
      name: "",
      rateLimit: "",
      localAddress: "",
      remoteAddress: "",
      comment: "",
    },
  });

  const title = initialProfile ? "Edit PPPoE profile" : "Create PPPoE profile";
  const submitLabel = initialProfile ? "Save changes" : "Create profile";

  useEffect(() => {
    if (!open) return;
    reset({
      template: "custom",
      cloneFrom: "",
      name: initialProfile?.name || "",
      rateLimit: initialProfile?.rateLimit || "",
      localAddress: initialProfile?.localAddress || "",
      remoteAddress: initialProfile?.remoteAddress || "",
      comment: initialProfile?.comment || "",
    });
  }, [initialProfile, open, reset]);

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title={title}
      description='Define a PPPoE access profile. Rate limit format example: "10M/5M".'
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) => onConfirm(values))}
      >
        {!initialProfile ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Start from preset"
              options={PPPOE_PROFILE_TEMPLATES.map((item) => ({ label: item.label, value: item.value }))}
              value={watch("template")}
              onChange={(event) => {
                const next = PPPOE_PROFILE_TEMPLATES.find((item) => item.value === event.target.value);
                setValue("template", event.target.value);
                if (!next || next.value === "custom") return;
                setValue("name", next.name);
                setValue("rateLimit", next.rateLimit);
                setValue("localAddress", next.localAddress);
                setValue("remoteAddress", next.remoteAddress);
                setValue("comment", next.comment);
              }}
            />
            <Select
              label="Or clone existing"
              options={cloneOptions}
              value={watch("cloneFrom")}
              onChange={(event) => {
                setValue("cloneFrom", event.target.value);
                const next = existingProfiles.find((item) => (item.id || item.name) === event.target.value);
                if (!next) return;
                setValue("name", `${next.name}-copy`);
                setValue("rateLimit", next.rateLimit || "");
                setValue("localAddress", next.localAddress || "");
                setValue("remoteAddress", next.remoteAddress || "");
                setValue("comment", next.comment || "");
              }}
            />
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Profile name"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input label="Rate limit" hint='Example: "10M/5M" for download/upload' error={errors.rateLimit?.message} {...register("rateLimit")} />
          <Select label="Local Address" options={localOptions} value={watch("localAddress") || ""} onChange={(event) => setValue("localAddress", event.target.value)} />
          <Select label="Remote Address" options={remoteOptions} value={watch("remoteAddress") || ""} onChange={(event) => setValue("remoteAddress", event.target.value)} />
        </div>
        <Input label="Comment" error={errors.comment?.message} {...register("comment")} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" isLoading={loading}>{submitLabel}</Button>
        </div>
      </form>
    </Modal>
  );
}

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { hotspotProfileSchema, type HotspotProfileSchema } from "@/features/hotspot/schemas/hotspot.schema";
import type { HotspotProfile, HotspotProfilePayload } from "@/features/hotspot/types/hotspot.types";

const HOTSPOT_PROFILE_TEMPLATES = [
  { label: "Custom", value: "custom", name: "", rateLimit: "", sessionTimeout: "", idleTimeout: "", comment: "" },
  { label: "Small day pass", value: "small-day", name: "small-day", rateLimit: "10M/5M", sessionTimeout: "1d", idleTimeout: "30m", comment: "Day-pass hotspot profile" },
  { label: "Standard day pass", value: "standard-day", name: "standard-day", rateLimit: "20M/10M", sessionTimeout: "1d", idleTimeout: "30m", comment: "Standard hotspot profile" },
  { label: "Premium day pass", value: "premium-day", name: "premium-day", rateLimit: "50M/20M", sessionTimeout: "1d", idleTimeout: "30m", comment: "Premium hotspot profile" },
  { label: "Evening burst", value: "evening-burst", name: "evening-burst", rateLimit: "30M/15M", sessionTimeout: "12h", idleTimeout: "20m", comment: "Short-session hotspot profile" },
];

export function EditHotspotProfileDialog({
  open,
  loading,
  profile,
  existingProfiles = [],
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  profile?: HotspotProfile | null;
  existingProfiles?: HotspotProfile[];
  onClose: () => void;
  onConfirm: (payload: HotspotProfilePayload) => void;
}) {
  const cloneOptions = useMemo(
    () => [{ label: "None", value: "" }, ...existingProfiles.map((item) => ({ label: `${item.name}${item.rateLimit ? ` • ${item.rateLimit}` : ""}`, value: item.id || item.name }))],
    [existingProfiles]
  );
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<HotspotProfileSchema & { template: string; cloneFrom: string }>({
    resolver: zodResolver(hotspotProfileSchema),
    defaultValues: {
      template: "custom",
      cloneFrom: "",
      name: "",
      rateLimit: "",
      sessionTimeout: "",
      idleTimeout: "",
      comment: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      template: "custom",
      cloneFrom: "",
      name: profile?.name || "",
      rateLimit: profile?.rateLimit || "",
      sessionTimeout: profile?.sessionTimeout || "",
      idleTimeout: profile?.idleTimeout || "",
      comment: profile?.comment || "",
    });
  }, [open, profile, reset]);

  const title = profile ? "Edit hotspot profile" : "Create hotspot profile";
  const submitLabel = profile ? "Save changes" : "Create profile";

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title={title}
      description='Use a preset or clone an existing profile, then fine-tune the rate-limit and timeouts. Rate limit example: "10M/5M".'
    >
      <form className="space-y-4" onSubmit={handleSubmit((values) => onConfirm(values))}>
        {!profile ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Start from preset"
              options={HOTSPOT_PROFILE_TEMPLATES.map((item) => ({ label: item.label, value: item.value }))}
              value={watch("template")}
              onChange={(event) => {
                const next = HOTSPOT_PROFILE_TEMPLATES.find((item) => item.value === event.target.value);
                setValue("template", event.target.value);
                if (!next || next.value === "custom") return;
                setValue("name", next.name);
                setValue("rateLimit", next.rateLimit);
                setValue("sessionTimeout", next.sessionTimeout);
                setValue("idleTimeout", next.idleTimeout);
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
                setValue("sessionTimeout", next.sessionTimeout || "");
                setValue("idleTimeout", next.idleTimeout || "");
                setValue("comment", next.comment || "");
              }}
            />
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Profile name" error={errors.name?.message} {...register("name")} />
          <Input label="Rate limit" hint='Example: "10M/5M" for download/upload' error={errors.rateLimit?.message} {...register("rateLimit")} />
          <Input label="Session timeout" hint='Examples: "1d", "12h", "01:00:00"' error={errors.sessionTimeout?.message} {...register("sessionTimeout")} />
          <Input label="Idle timeout" hint='Examples: "5m", "30m", "00:10:00"' error={errors.idleTimeout?.message} {...register("idleTimeout")} />
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

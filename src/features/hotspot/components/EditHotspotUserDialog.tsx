import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Select } from "@/components/ui/Select";
import { hotspotUserSchema, type HotspotUserSchema } from "@/features/hotspot/schemas/hotspot.schema";
import type { HotspotProfile, HotspotUser, HotspotUserPayload } from "@/features/hotspot/types/hotspot.types";

function fromBytesToForm(bytes: number) {
  if (!bytes) return { value: 0, unit: "unlimited" as const };
  if (bytes % (1024 ** 3) === 0) return { value: bytes / (1024 ** 3), unit: "GB" as const };
  return { value: Math.round(bytes / (1024 ** 2)), unit: "MB" as const };
}

function fromSecondsToForm(seconds: number) {
  if (!seconds) return { value: 0, unit: "unlimited" as const };
  if (seconds % 86400 === 0) return { value: seconds / 86400, unit: "days" as const };
  return { value: Math.round(seconds / 3600), unit: "hours" as const };
}

function toPayload(values: HotspotUserSchema): HotspotUserPayload {
  return {
    username: values.username.trim(),
    password: values.password || undefined,
    profile: values.profile,
    dataLimitBytes: values.dataLimitUnit === "unlimited" ? 0 : values.dataLimitValue * (values.dataLimitUnit === "GB" ? 1024 ** 3 : 1024 ** 2),
    timeLimitSeconds: values.timeLimitUnit === "unlimited" ? 0 : values.timeLimitValue * (values.timeLimitUnit === "days" ? 86400 : 3600),
    expiresAt: values.expiresAt || null,
    comment: values.comment || "",
    isActive: values.isActive,
  };
}

export function EditHotspotUserDialog({
  open,
  loading,
  user,
  profiles,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  user: HotspotUser | null;
  profiles: HotspotProfile[];
  onClose: () => void;
  onConfirm: (payload: HotspotUserPayload) => void;
}) {
  const profileOptions = useMemo(() => (profiles.length ? profiles : [{ name: "default", rateLimit: "", sessionTimeout: "", idleTimeout: "" }]).map((profile) => ({ label: profile.name, value: profile.name })), [profiles]);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<HotspotUserSchema>({
    resolver: zodResolver(hotspotUserSchema),
    defaultValues: {
      username: "",
      password: "",
      profile: "default",
      dataLimitValue: 0,
      dataLimitUnit: "unlimited",
      timeLimitValue: 0,
      timeLimitUnit: "unlimited",
      expiresAt: "",
      comment: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!user) return;
    const dataLimit = fromBytesToForm(user.dataLimitBytes || 0);
    const timeLimit = fromSecondsToForm(user.timeLimitSeconds || 0);
    reset({
      username: user.username,
      password: "",
      profile: user.profile || "default",
      dataLimitValue: dataLimit.value,
      dataLimitUnit: dataLimit.unit,
      timeLimitValue: timeLimit.value,
      timeLimitUnit: timeLimit.unit,
      expiresAt: user.expiresAt ? String(user.expiresAt).slice(0, 10) : "",
      comment: user.comment || "",
      isActive: user.isActive,
    });
  }, [reset, user]);

  const onSubmit = handleSubmit((values) => onConfirm(toPayload(values)));

  return (
    <Modal open={open} onClose={onClose} title="Edit hotspot user" description="Update the hotspot account, quota, and state for this router user.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Username" error={errors.username?.message} {...register("username")} />
          <PasswordInput label="New password (optional)" error={errors.password?.message} {...register("password")} />
          <Select label="Profile" options={profileOptions} value={watch("profile")} {...register("profile")} />
          <Input label="Comment" error={errors.comment?.message} {...register("comment")} />
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
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Expires at" type="date" error={errors.expiresAt?.message as string | undefined} {...register("expiresAt")} />
          <Select label="State" options={[{ label: "Active", value: "true" }, { label: "Disabled", value: "false" }]} value={String(watch("isActive"))} onChange={(event) => setValue("isActive", event.target.value === "true")} />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={loading} disabled={!user}>Save changes</Button>
        </div>
      </form>
    </Modal>
  );
}

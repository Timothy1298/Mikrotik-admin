import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Select } from "@/components/ui/Select";
import { hotspotUserSchema, type HotspotUserSchema } from "@/features/hotspot/schemas/hotspot.schema";
import type { HotspotProfile, HotspotUserPayload } from "@/features/hotspot/types/hotspot.types";

function toPayload(values: HotspotUserSchema): HotspotUserPayload {
  const dataLimitBytes = values.dataLimitUnit === "unlimited" ? 0 : values.dataLimitValue * (values.dataLimitUnit === "GB" ? 1024 ** 3 : 1024 ** 2);
  const timeLimitSeconds = values.timeLimitUnit === "unlimited" ? 0 : values.timeLimitValue * (values.timeLimitUnit === "days" ? 86400 : 3600);
  return {
    username: values.username.trim(),
    password: values.password || "",
    profile: values.profile,
    dataLimitBytes,
    timeLimitSeconds,
    expiresAt: values.expiresAt || null,
    comment: values.comment || "",
    isActive: values.isActive,
  };
}

export function CreateHotspotUserDialog({
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
  onConfirm: (payload: HotspotUserPayload) => void;
}) {
  const profileOptions = useMemo(() => (profiles.length ? profiles : [{ name: "default", rateLimit: "", sessionTimeout: "", idleTimeout: "" }]).map((profile) => ({ label: profile.name, value: profile.name })), [profiles]);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<HotspotUserSchema>({
    resolver: zodResolver(hotspotUserSchema),
    defaultValues: {
      username: "",
      password: "",
      profile: profileOptions[0]?.value || "default",
      dataLimitValue: 0,
      dataLimitUnit: "unlimited",
      timeLimitValue: 0,
      timeLimitUnit: "unlimited",
      expiresAt: "",
      comment: "",
      isActive: true,
    },
  });

  const onSubmit = handleSubmit((values) => {
    onConfirm(toPayload(values));
  });

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Create hotspot user" description="Add a RouterOS hotspot account with profile, quota, and optional expiry controls.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Username" error={errors.username?.message} {...register("username")} />
          <PasswordInput label="Password" error={errors.password?.message} {...register("password")} />
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

        <Input label="Expires at" type="date" error={errors.expiresAt?.message as string | undefined} {...register("expiresAt")} />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" isLoading={loading}>Create user</Button>
        </div>
      </form>
    </Modal>
  );
}

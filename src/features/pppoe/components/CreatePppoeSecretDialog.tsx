import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Select } from "@/components/ui/Select";
import { pppoeSecretSchema, type PppoeSecretSchema } from "@/features/pppoe/schemas/pppoe.schema";
import type { PppoeProfile, PppoeSecretPayload } from "@/features/pppoe/types/pppoe.types";

export function CreatePppoeSecretDialog({
  open,
  loading,
  profiles,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  profiles: PppoeProfile[];
  onClose: () => void;
  onConfirm: (payload: PppoeSecretPayload) => void;
}) {
  const profileOptions = useMemo(() => (profiles.length ? profiles : [{ name: "default", localAddress: "", remoteAddress: "", rateLimit: "" }]).map((profile) => ({ label: profile.name, value: profile.name })), [profiles]);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PppoeSecretSchema>({
    resolver: zodResolver(pppoeSecretSchema),
    defaultValues: {
      name: "",
      password: "",
      profile: profileOptions[0]?.value || "default",
      service: "pppoe",
      localAddress: "",
      remoteAddress: "",
      comment: "",
      isDisabled: false,
    },
  });

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Create PPPoE subscriber" description="Add a router-side PPPoE subscriber account for customer authentication.">
      <form className="space-y-4" onSubmit={handleSubmit((values) => onConfirm({ ...values, password: values.password || "" }))}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Username" error={errors.name?.message} {...register("name")} />
          <PasswordInput label="Password" error={errors.password?.message} {...register("password")} />
          <Select label="Profile" options={profileOptions} value={watch("profile")} {...register("profile")} />
          <Select label="Service" options={[{ label: "PPPoE", value: "pppoe" }, { label: "Any", value: "any" }]} value={watch("service")} {...register("service")} />
          <Input label="Local Address" error={errors.localAddress?.message} {...register("localAddress")} />
          <Input label="Remote Address" error={errors.remoteAddress?.message} {...register("remoteAddress")} />
        </div>
        <Input label="Comment" error={errors.comment?.message} {...register("comment")} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" isLoading={loading}>Create subscriber</Button>
        </div>
      </form>
    </Modal>
  );
}

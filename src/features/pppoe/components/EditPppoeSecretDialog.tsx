import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Select } from "@/components/ui/Select";
import { pppoeSecretSchema, type PppoeSecretSchema } from "@/features/pppoe/schemas/pppoe.schema";
import type { PppoeProfile, PppoeSecret, PppoeSecretPayload } from "@/features/pppoe/types/pppoe.types";

export function EditPppoeSecretDialog({
  open,
  loading,
  subscriber,
  profiles,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  subscriber: PppoeSecret | null;
  profiles: PppoeProfile[];
  onClose: () => void;
  onConfirm: (payload: PppoeSecretPayload) => void;
}) {
  const profileOptions = useMemo(() => (profiles.length ? profiles : [{ name: "default", localAddress: "", remoteAddress: "", rateLimit: "" }]).map((profile) => ({ label: profile.name, value: profile.name })), [profiles]);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PppoeSecretSchema>({
    resolver: zodResolver(pppoeSecretSchema),
    defaultValues: {
      name: "",
      password: "",
      profile: "default",
      service: "pppoe",
      localAddress: "",
      remoteAddress: "",
      comment: "",
      isDisabled: false,
    },
  });

  useEffect(() => {
    if (!subscriber) return;
    reset({
      name: subscriber.name,
      password: "",
      profile: subscriber.profile || "default",
      service: subscriber.service === "any" ? "any" : "pppoe",
      localAddress: subscriber.localAddress || "",
      remoteAddress: subscriber.remoteAddress || "",
      comment: subscriber.comment || "",
      isDisabled: subscriber.isDisabled,
    });
  }, [reset, subscriber]);

  return (
    <Modal open={open} onClose={onClose} title="Edit PPPoE subscriber" description="Update the router-side PPPoE subscriber profile, addressing, and access state.">
      <form className="space-y-4" onSubmit={handleSubmit((values) => onConfirm(values))}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Username" error={errors.name?.message} {...register("name")} />
          <PasswordInput label="New password (optional)" error={errors.password?.message} {...register("password")} />
          <Select label="Profile" options={profileOptions} value={watch("profile")} {...register("profile")} />
          <Select label="Service" options={[{ label: "PPPoE", value: "pppoe" }, { label: "Any", value: "any" }]} value={watch("service")} {...register("service")} />
          <Input label="Local Address" error={errors.localAddress?.message} {...register("localAddress")} />
          <Input label="Remote Address" error={errors.remoteAddress?.message} {...register("remoteAddress")} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Comment" error={errors.comment?.message} {...register("comment")} />
          <Select label="State" options={[{ label: "Enabled", value: "false" }, { label: "Disabled", value: "true" }]} value={String(watch("isDisabled"))} onChange={(event) => setValue("isDisabled", event.target.value === "true")} />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={loading} disabled={!subscriber}>Save changes</Button>
        </div>
      </form>
    </Modal>
  );
}

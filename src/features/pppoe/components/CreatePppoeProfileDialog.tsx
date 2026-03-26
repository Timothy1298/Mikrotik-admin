import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { pppoeProfileSchema, type PppoeProfileSchema } from "@/features/pppoe/schemas/pppoe.schema";
import type { PppoeProfile, PppoeProfilePayload } from "@/features/pppoe/types/pppoe.types";

export function CreatePppoeProfileDialog({
  open,
  loading,
  initialProfile,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  initialProfile?: PppoeProfile | null;
  onClose: () => void;
  onConfirm: (payload: PppoeProfilePayload) => void;
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PppoeProfileSchema>({
    resolver: zodResolver(pppoeProfileSchema),
    defaultValues: {
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
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Profile name"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input label="Rate limit" hint='Example: "10M/5M" for download/upload' error={errors.rateLimit?.message} {...register("rateLimit")} />
          <Input label="Local Address" error={errors.localAddress?.message} {...register("localAddress")} />
          <Input label="Remote Address" error={errors.remoteAddress?.message} {...register("remoteAddress")} />
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

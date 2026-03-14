import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordStrength } from "@/features/auth/components/PasswordStrength";
import { resetPasswordSchema, type ResetPasswordSchema } from "@/features/auth/schemas/auth.schema";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";

export function ResetPasswordForm({ token }: { token: string }) {
  const mutation = useResetPassword();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });
  const password = watch("password");
  const capsLockOn = useMemo(() => false, []);

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(({ token: resetToken, password }) => mutation.mutate({ token: resetToken, password }))}>
      <input type="hidden" {...register("token")} />
      <PasswordInput label="New password" error={errors.password?.message} capsLockOn={capsLockOn} {...register("password")} />
      <PasswordStrength password={password} />
      <PasswordInput label="Confirm password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
      <Button type="submit" isLoading={mutation.isPending}>Reset password</Button>
    </form>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "@/features/auth/schemas/auth.schema";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";

export function ForgotPasswordForm() {
  const mutation = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordSchema>({ resolver: zodResolver(forgotPasswordSchema) });
  return (
    <form className="grid gap-4" onSubmit={handleSubmit((values) => mutation.mutate(values.email))}>
      <Input label="Email" placeholder="admin@example.com" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register("email")} />
      <Button type="submit" isLoading={mutation.isPending}>Send reset instructions</Button>
    </form>
  );
}

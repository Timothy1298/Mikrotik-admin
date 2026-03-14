import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/auth.schema";
import { useLogin } from "@/features/auth/hooks/useLogin";

export function LoginForm() {
  const mutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form className="grid gap-5" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <Input
        label="Email address"
        placeholder="admin@example.com"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register("email")}
      />

     <PasswordInput
  label="Password"
  placeholder="Enter your password"
  autoComplete="current-password"
  error={errors.password?.message}
  {...register("password")}
/>

      <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
        <Checkbox label="Remember this device" />
        <span className="text-xs uppercase tracking-[0.18em] text-brand-100">Encrypted session</span>
      </div>

      {mutation.isError ? (
        <InlineError message={mutation.error instanceof Error ? mutation.error.message : "Unable to sign in. Check your credentials."} />
      ) : null}

      <Button type="submit" size="lg" isLoading={mutation.isPending} className="mt-2 w-full">
        Sign in to admin console
      </Button>
    </form>
  );
}

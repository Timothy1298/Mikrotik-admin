import { useQueryParams } from "@/hooks/utils/useQueryParams";
import { AuthHero } from "@/features/auth/components/AuthHero";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export function ResetPasswordPage() {
  const params = useQueryParams();
  const token = params.get("token") ?? "";

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="surface-card-3d p-8">
        <h1 className="text-3xl font-semibold text-slate-100">Reset password</h1>
        <p className="mt-3 text-sm text-slate-400">Choose a strong password for your admin account.</p>
        <div className="mt-8"><ResetPasswordForm token={token} /></div>
      </div>
      <AuthHero />
    </div>
  );
}

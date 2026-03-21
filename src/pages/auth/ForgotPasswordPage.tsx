import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { AuthHero } from "@/features/auth/components/AuthHero";

export function ForgotPasswordPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="surface-card-3d p-8">
        <h1 className="text-3xl font-semibold text-text-primary">Forgot password</h1>
        <p className="mt-3 text-sm text-text-secondary">Enter your admin email address and we will send reset instructions if the account exists.</p>
        <div className="mt-8"><ForgotPasswordForm /></div>
      </div>
      <AuthHero />
    </div>
  );
}

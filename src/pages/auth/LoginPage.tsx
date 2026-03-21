import { Link } from "react-router-dom";
import { AuthHero } from "@/features/auth/components/AuthHero";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { appRoutes } from "@/config/routes";

export function LoginPage() {
  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(460px,0.92fr)_minmax(520px,1.08fr)] xl:gap-8">
      <section className="surface-card-3d animate-fade-up flex min-h-[680px] flex-col justify-between p-6 sm:p-8 lg:min-h-[760px] lg:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Secure admin access</p>
          <h1 className="mt-4 max-w-md text-3xl font-semibold leading-tight text-text-primary sm:text-4xl">Sign in to Mikrotik Admin</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
            Use your administrator credentials to access routers, WireGuard clients, monitoring telemetry, billing tools, and support operations.
          </p>
        </div>

        <div className="my-8 flex-1">
          <LoginForm />
        </div>

        <div className="flex flex-col gap-3 border-t border-background-border pt-6 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <p>Secure access for authorized personnel only.</p>
          <p>
            Forgot your password?{" "}
            <Link to={appRoutes.forgotPassword} className="text-primary transition hover:text-text-primary">
              Reset it here
            </Link>
          </p>
        </div>
      </section>

      <AuthHero />
    </div>
  );
}

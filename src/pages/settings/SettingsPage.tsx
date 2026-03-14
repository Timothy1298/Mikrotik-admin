import { Link, useLocation } from "react-router-dom";
import { BadgeCheck, LockKeyhole, Settings2, Shield, UserCircle2 } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { PageHeader } from "@/components/layout/PageHeader";
import { appRoutes } from "@/config/routes";
import { env } from "@/config/env";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const settingsViews = {
  [appRoutes.settings]: {
    title: "Profile",
    description: "Review the active operator profile, role coverage, and account context used for admin operations.",
    icon: UserCircle2,
  },
  [appRoutes.settingsSecurity]: {
    title: "Security",
    description: "Review the current session posture, authentication coverage, and role-based security controls.",
    icon: LockKeyhole,
  },
  [appRoutes.settingsSystem]: {
    title: "System",
    description: "Inspect environment-level admin console configuration and runtime defaults used by the frontend shell.",
    icon: Settings2,
  },
} as const;

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.66)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}

export function SettingsPage() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const view = settingsViews[location.pathname as keyof typeof settingsViews] ?? settingsViews[appRoutes.settings];
  const ViewIcon = view.icon;
  const sessionStatus = user ? "Authenticated session active" : "No active operator session";

  return (
    <section className="space-y-6">
      <PageHeader
        title={`Settings · ${view.title}`}
        description={view.description}
        meta={env.appEnv}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <Card className="space-y-5">
          <CardHeader className="mb-0">
            <div className="flex items-start gap-4">
              <div className="icon-block-highlight rounded-2xl p-3">
                <ViewIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{view.title}</CardTitle>
                <CardDescription>{view.description}</CardDescription>
              </div>
            </div>
            <Badge tone="info">{sessionStatus}</Badge>
          </CardHeader>

          <div className="grid gap-3 md:grid-cols-2">
            <SummaryItem label="Operator" value={user?.name ?? "Unknown operator"} />
            <SummaryItem label="Email" value={user?.email ?? "No email available"} />
            <SummaryItem label="Role" value={user?.role ?? "No role loaded"} />
            <SummaryItem label="Permissions" value={`${user?.permissions.length ?? 0} effective grants`} />
          </div>

          {location.pathname === appRoutes.settings ? (
            <div className="grid gap-3 md:grid-cols-2">
              <SummaryItem label="Profile route" value={appRoutes.settings} />
              <SummaryItem label="Access scope" value="User, infrastructure, billing, security, and support modules" />
            </div>
          ) : null}

          {location.pathname === appRoutes.settingsSecurity ? (
            <div className="grid gap-3 md:grid-cols-2">
              <SummaryItem label="Session protection" value="Bearer token with 401 expiry handling" />
              <SummaryItem label="Auth validation" value="Boot-time session verification against /api/auth/me" />
              <SummaryItem label="Failure handling" value="Toast feedback plus redirect to secure sign-in" />
              <SummaryItem label="Access model" value="Permission-aware sidebar and route protection" />
            </div>
          ) : null}

          {location.pathname === appRoutes.settingsSystem ? (
            <div className="grid gap-3 md:grid-cols-2">
              <SummaryItem label="API base URL" value={env.apiBaseUrl} />
              <SummaryItem label="Request timeout" value={`${env.requestTimeout} ms`} />
              <SummaryItem label="Application" value={env.appName} />
              <SummaryItem label="Mock mode" value={env.enableMocks ? "Enabled" : "Disabled"} />
            </div>
          ) : null}
        </Card>

        <Card className="space-y-4">
          <CardHeader className="mb-0">
            <div>
              <CardTitle>Settings areas</CardTitle>
              <CardDescription>Use the sidebar or these shortcuts to jump between the active admin settings views.</CardDescription>
            </div>
          </CardHeader>

          <div className="grid gap-2">
            <Link to={appRoutes.settings} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.66)] px-4 py-3 text-sm text-slate-200 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)]">
              Profile
            </Link>
            <Link to={appRoutes.settingsSecurity} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.66)] px-4 py-3 text-sm text-slate-200 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)]">
              Security
            </Link>
            <Link to={appRoutes.settingsSystem} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.66)] px-4 py-3 text-sm text-slate-200 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)]">
              System
            </Link>
          </div>

          <div className="rounded-2xl border border-brand-500/15 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(56,189,248,0.04))] p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 text-brand-100" />
              <div>
                <p className="text-sm font-semibold text-slate-100">Operational note</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  This area is now a live admin reference surface. Persisted profile and system mutations should only be added when the backend settings service is available.
                </p>
              </div>
            </div>
          </div>

          <Link to={appRoutes.dashboard}>
            <Button variant="secondary" className="w-full" leftIcon={<BadgeCheck className="h-4 w-4" />}>
              Return to dashboard
            </Button>
          </Link>
        </Card>
      </div>
    </section>
  );
}

import { useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { BadgeCheck, LockKeyhole, Settings2, Shield, UserCircle2 } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { ErrorState } from "@/components/feedback/ErrorState";
import { InlineError } from "@/components/feedback/InlineError";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Tabs } from "@/components/ui/Tabs";
import { appRoutes } from "@/config/routes";
import { settingsTabs } from "@/config/module-tabs";
import { env } from "@/config/env";
import { usePlatformConfig, useSettings, useUpdateAdminProfile } from "@/features/settings/hooks";
import { useForceLogoutUser } from "@/features/users/hooks";
import { permissions } from "@/lib/permissions/permissions";
import { can } from "@/lib/permissions/can";

const settingsViews = {
  [appRoutes.settings]: {
    title: "Profile",
    description: "Update your operator profile and password.",
    icon: UserCircle2,
  },
  [appRoutes.settingsSecurity]: {
    title: "Security",
    description: "Review current session posture and future MFA coverage.",
    icon: LockKeyhole,
  },
  [appRoutes.settingsSystem]: {
    title: "System",
    description: "Inspect runtime defaults and server-provided platform configuration.",
    icon: Settings2,
  },
  [appRoutes.settingsAdmins]: {
    title: "Admin Accounts",
    description: "Create and manage admin users, roles, and access scope.",
    icon: Shield,
  },
  [appRoutes.settingsServicePlans]: {
    title: "Service Plans",
    description: "Manage subscriber plans, speeds, limits, and prepaid vouchers.",
    icon: BadgeCheck,
  },
  [appRoutes.settingsResellers]: {
    title: "Resellers",
    description: "Foundation entry point for future reseller and franchise tooling.",
    icon: Shield,
  },
} as const;

function SummaryItem({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.66)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-100">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function formatAdminRole(role?: string | null) {
  if (!role) return "Legacy Admin";
  return role.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function SettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const settingsQuery = useSettings();
  const platformQuery = usePlatformConfig();
  const updateProfileMutation = useUpdateAdminProfile();
  const forceLogoutMutation = useForceLogoutUser();

  const [displayName, setDisplayName] = useState(user?.name || "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const view = settingsViews[location.pathname as keyof typeof settingsViews] ?? settingsViews[appRoutes.settings];
  const ViewIcon = view.icon;

  const settingsLinks = useMemo(() => {
    const links: Array<{ label: string; path: string }> = [
      { label: "Profile", path: appRoutes.settings },
      { label: "Security", path: appRoutes.settingsSecurity },
      { label: "System", path: appRoutes.settingsSystem },
    ];

    if (can(user || undefined, permissions.settingsManage)) {
      links.push({ label: "Admin Accounts", path: appRoutes.settingsAdmins });
    }
    if (can(user || undefined, permissions.servicePlansView)) {
      links.push({ label: "Service Plans", path: appRoutes.settingsServicePlans });
    }
    if (can(user || undefined, permissions.settingsManage)) {
      links.push({ label: "Resellers", path: appRoutes.settingsResellers });
    }
    return links;
  }, [user]);

  const visibleTabs = useMemo(() => {
    return settingsTabs.filter((tab) => {
      if (tab.value === appRoutes.settingsAdmins || tab.value === appRoutes.settingsResellers) {
        return can(user || undefined, permissions.settingsManage);
      }
      if (tab.value === appRoutes.settingsServicePlans) {
        return can(user || undefined, permissions.servicePlansView);
      }
      return true;
    });
  }, [user]);

  if (
    location.pathname === appRoutes.settingsAdmins ||
    location.pathname === appRoutes.settingsServicePlans ||
    location.pathname === appRoutes.settingsResellers
  ) {
    return <Navigate to={appRoutes.settings} replace />;
  }

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError(null);
    if (!displayName.trim()) {
      setProfileError("Display name is required.");
      return;
    }
    try {
      await updateProfileMutation.mutateAsync({ name: displayName.trim() });
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Failed to update password");
    }
  };

  const handleRevokeCurrentSessions = () => {
    if (!user?.id) return;
    forceLogoutMutation.mutate([user.id] as never);
  };

  const renderMainContent = () => {
    if (location.pathname === appRoutes.settings) {
      return (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update the name shown throughout the admin console.</CardDescription>
              </div>
            </CardHeader>
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <Input label="Display Name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
              <Input label="Email Address" value={user?.email || ""} disabled hint="Email cannot be changed from this panel." />
              <Input label="Admin Role" value={formatAdminRole(user?.adminRole)} disabled />
              {profileError ? <InlineError message={profileError} /> : null}
              <div className="flex justify-end">
                <Button type="submit" isLoading={updateProfileMutation.isPending}>Save Changes</Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your current credentials without editing your profile information.</CardDescription>
              </div>
            </CardHeader>
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <PasswordInput label="Current Password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
              <PasswordInput label="New Password" hint="Minimum 6 characters." value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
              <PasswordInput label="Confirm New Password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              {passwordError ? <InlineError message={passwordError} /> : null}
              <div className="flex justify-end">
                <Button type="submit" isLoading={updateProfileMutation.isPending}>Update Password</Button>
              </div>
            </form>
          </Card>
        </div>
      );
    }

    if (location.pathname === appRoutes.settingsSecurity) {
      return (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Prepare for stronger operator authentication once backend support is available.</CardDescription>
              </div>
              <Badge tone="warning">Not configured</Badge>
            </CardHeader>
            <p className="text-sm leading-6 text-slate-400">
              Two-factor authentication is not yet available. When enabled, you will be required to enter a verification code on each login.
            </p>
            <div className="pt-2">
              <Button variant="outline" disabled>Enable 2FA</Button>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Current Session</CardTitle>
                <CardDescription>Review the currently stored session token and revoke active sessions if needed.</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <SummaryItem label="Session token" value={token ? `...${token.slice(-8)}` : "No active session"} />
              <SummaryItem label="Permission mode" value={user?.adminRole ? formatAdminRole(user.adminRole) : "Legacy full admin"} />
            </div>
            <div className="pt-2">
              <Button variant="outline" isLoading={forceLogoutMutation.isPending} onClick={handleRevokeCurrentSessions}>
                Sign out all sessions
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    if (location.pathname === appRoutes.settingsSystem) {
      if (settingsQuery.isPending || platformQuery.isPending) return <SectionLoader />;
      if (settingsQuery.isError || !settingsQuery.data) {
        return <ErrorState title="Unable to load frontend settings" description="The frontend runtime settings could not be loaded." onAction={() => void settingsQuery.refetch()} />;
      }
      if (platformQuery.isError || !platformQuery.data) {
        return <ErrorState title="Unable to load platform configuration" description="The platform config endpoint is not available." onAction={() => void platformQuery.refetch()} />;
      }

      return (
        <div className="grid gap-5 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Runtime Config</CardTitle>
                <CardDescription>Frontend shell values loaded from the current environment.</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <SummaryItem label="API URL" value={settingsQuery.data.apiBaseUrl} />
              <SummaryItem label="Environment" value={settingsQuery.data.appEnv} />
              <SummaryItem label="Request timeout" value={`${settingsQuery.data.requestTimeout} ms`} />
              <SummaryItem label="Mock mode" value={settingsQuery.data.mockModeEnabled ? "Enabled" : "Disabled"} />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Platform Defaults</CardTitle>
                <CardDescription>Server-provided defaults used for subscriptions and infrastructure provisioning.</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <SummaryItem label="Router monthly price" value={String(platformQuery.data.routerMonthlyPrice)} />
              <SummaryItem label="Trial period" value={`${platformQuery.data.trialDays} days`} />
              <SummaryItem label="Server region" value={platformQuery.data.serverRegion} />
              <SummaryItem label="App version" value={platformQuery.data.appVersion} />
            </div>
            <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.66)] p-4 text-sm text-slate-400">
              <p>These values are configured via environment variables on the server. Contact your system administrator to modify them.</p>
              <p className="mt-3">Audit logs are retained indefinitely. Configure log retention in server environment variables (`LOG_RETENTION_DAYS`).</p>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{view.title}</CardTitle>
            <CardDescription>{view.description}</CardDescription>
          </div>
        </CardHeader>
        <p className="text-sm text-slate-400">
          This area has its own dedicated page. Use the shortcut card on the right or the settings tabs above to open it.
        </p>
      </Card>
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title={`Settings · ${view.title}`} description={view.description} meta={env.appEnv} />
        {(location.pathname === appRoutes.settingsSystem) ? <RefreshButton loading={platformQuery.isFetching} onClick={() => void platformQuery.refetch()} /> : null}
      </div>

      <Tabs tabs={[...visibleTabs]} value={location.pathname} onChange={navigate} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <div className="space-y-5">
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
              <Badge tone="info">{user ? "Authenticated session active" : "No active operator session"}</Badge>
            </CardHeader>

            <div className="grid gap-3 md:grid-cols-2">
              <SummaryItem label="Operator" value={user?.name ?? "Unknown operator"} />
              <SummaryItem label="Email" value={user?.email ?? "No email available"} />
              <SummaryItem label="Role" value={user?.role ?? "No role loaded"} />
              <SummaryItem label="Admin scope" value={formatAdminRole(user?.adminRole)} />
            </div>
          </Card>

          {renderMainContent()}
        </div>

        <Card className="space-y-4">
          <CardHeader className="mb-0">
            <div>
              <CardTitle>Settings Areas</CardTitle>
              <CardDescription>Jump between operator profile, system controls, and final-module admin surfaces.</CardDescription>
            </div>
          </CardHeader>

          <div className="grid gap-2">
            {settingsLinks.map((link) => (
              <Link key={link.path} to={link.path} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.66)] px-4 py-3 text-sm text-slate-200 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)]">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="rounded-2xl border border-brand-500/15 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(56,189,248,0.04))] p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 text-brand-100" />
              <div>
                <p className="text-sm font-semibold text-slate-100">Operational note</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  The final module sweep adds profile mutation, admin account management, and service-plan management. Reseller tooling remains a future release.
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

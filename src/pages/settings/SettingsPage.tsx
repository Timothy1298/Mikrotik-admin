import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/shared/PageSection";
import { InlineInfo } from "@/components/shared/InlineInfo";
import { Switch } from "@/components/ui/Switch";

export function SettingsPage() {
  return (
    <section className="space-y-6">
      <PageHeader title="Settings" description="Profile, security, and system configuration should be organized into compact, readable sections from the beginning." />
      <PageSection title="Profile preferences" description="Operator-focused settings and UI preferences.">
        <InlineInfo>Theme, density, and notification preferences can be managed here once persistence is connected.</InlineInfo>
      </PageSection>
      <PageSection title="Security controls" description="Session and security-related toggles should be grouped here.">
        <Switch checked={true} label="Require secure session checks" />
      </PageSection>
      <PageSection title="System configuration" description="Environment-level values, pricing, and operational defaults belong here.">
        <InlineInfo>Keep sensitive infrastructure settings permission-aware and role-gated.</InlineInfo>
      </PageSection>
    </section>
  );
}

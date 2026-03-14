import { KeyValueGrid } from "@/components/data-display/KeyValueGrid";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";

export function VpnServerDetailsPage() {
  return (
    <section className="space-y-6">
      <PageHeader title="VPN server details" description="This page is reserved for deeper operational breakdowns: interface health, peer count, stale peers, and host-level networking." />
      <Card>
        <KeyValueGrid items={[
          { label: "Region", value: "Placeholder" },
          { label: "Status", value: "Healthy" },
          { label: "Peers", value: "0" },
          { label: "Endpoint", value: "vpn.example.com:51820" },
        ]} />
      </Card>
    </section>
  );
}

import { Server } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function VpnServersPage() {
  return (
    <section className="space-y-6">
      <PageHeader title="VPN servers" description="Use this area for multi-server management, peer balancing, and deployment status when your backend grows beyond a single WireGuard node." />
      <EmptyState icon={Server} title="VPN server management scaffolded" description="The route exists and can later host regional server inventory, health, and capacity charts." />
    </section>
  );
}

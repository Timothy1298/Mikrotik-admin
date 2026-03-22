import { useState } from "react";
import { InlineError } from "@/components/feedback/InlineError";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { DhcpLeasesTable } from "@/features/network-config/components/DhcpLeasesTable";
import { InterfacesTable } from "@/features/network-config/components/InterfacesTable";
import { WirelessClientsTable } from "@/features/network-config/components/WirelessClientsTable";
import {
  useDeleteLease,
  useDhcpLeases,
  useMakeStaticLease,
  useNetworkInterfaces,
  useSetInterfaceEnabled,
  useWirelessClients,
} from "@/features/network-config/hooks/useNetworkConfig";

export function RouterNetworkPanel({ routerId }: { routerId: string }) {
  const [tab, setTab] = useState<"interfaces" | "dhcp" | "wireless">("interfaces");
  const interfacesQuery = useNetworkInterfaces(routerId);
  const leasesQuery = useDhcpLeases(routerId);
  const wirelessQuery = useWirelessClients(routerId);
  const makeStaticMutation = useMakeStaticLease(routerId);
  const deleteLeaseMutation = useDeleteLease(routerId);
  const setInterfaceMutation = useSetInterfaceEnabled(routerId);

  return (
    <Card className="space-y-5">
      <CardHeader>
        <div>
          <CardTitle>Network</CardTitle>
          <CardDescription>Review interface state, DHCP lease assignments, and wireless client registrations on this router.</CardDescription>
        </div>
      </CardHeader>

      <Tabs
        tabs={[
          { label: "Interfaces", value: "interfaces" },
          { label: "DHCP Leases", value: "dhcp" },
          { label: "Wireless", value: "wireless" },
        ]}
        value={tab}
        onChange={(value) => setTab(value as "interfaces" | "dhcp" | "wireless")}
      />

      {interfacesQuery.isError ? <InlineError message={interfacesQuery.error instanceof Error ? interfacesQuery.error.message : "Unable to load interfaces"} /> : null}
      {leasesQuery.isError ? <InlineError message={leasesQuery.error instanceof Error ? leasesQuery.error.message : "Unable to load DHCP leases"} /> : null}
      {wirelessQuery.isError ? <InlineError message={wirelessQuery.error instanceof Error ? wirelessQuery.error.message : "Unable to load wireless clients"} /> : null}

      {tab === "interfaces" ? (
        <InterfacesTable
          rows={interfacesQuery.data || []}
          isLoading={interfacesQuery.isPending}
          onToggleEnabled={(item, enabled) => setInterfaceMutation.mutate({ name: item.name, enabled })}
        />
      ) : tab === "dhcp" ? (
        <DhcpLeasesTable
          rows={leasesQuery.data || []}
          isLoading={leasesQuery.isPending}
          onMakeStatic={(lease) => makeStaticMutation.mutate(lease.routerosId)}
          onDelete={(lease) => {
            if (!window.confirm(`Delete DHCP lease ${lease.address || lease.activeAddress}?`)) return;
            deleteLeaseMutation.mutate(lease.routerosId);
          }}
        />
      ) : (
        <WirelessClientsTable rows={wirelessQuery.data || []} isLoading={wirelessQuery.isPending} />
      )}
    </Card>
  );
}

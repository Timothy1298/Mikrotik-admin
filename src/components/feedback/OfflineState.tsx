import { WifiOff } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";

export function OfflineState() {
  return <EmptyState icon={WifiOff} title="You are offline" description="Reconnect to the network and retry the request. The UI remains available for non-network actions." />;
}

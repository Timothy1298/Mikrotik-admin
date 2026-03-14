import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function RefreshButton({ loading, onClick }: { loading?: boolean; onClick?: () => void }) {
  return <Button variant="outline" leftIcon={<RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />} onClick={onClick} disabled={loading}>{loading ? "Refreshing" : "Refresh"}</Button>;
}

import { RouterHealthTable } from "@/features/monitoring/components/RouterHealthTable";
import type { RouterRow } from "@/features/routers/types/router.types";

export function ProvisioningIssuesTable({ rows, onOpen }: { rows: RouterRow[]; onOpen: (row: RouterRow) => void }) {
  return <RouterHealthTable rows={rows} onOpen={onOpen} />;
}

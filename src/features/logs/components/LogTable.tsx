import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/Button";
import { appRoutes } from "@/config/routes";

export function LogTable() {
  return (
    <div className="rounded-3xl border border-background-border bg-background-panel p-5">
      <EmptyState icon={FileText} title="Use the logs security workspace" description="The legacy log table has been superseded by the integrated logs, audit, and security investigation module." />
      <div className="mt-4 flex justify-center">
        <Link to={appRoutes.logsSecurityOverview}>
          <Button variant="secondary">Open logs workspace</Button>
        </Link>
      </div>
    </div>
  );
}

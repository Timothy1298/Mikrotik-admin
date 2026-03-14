import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/Button";
import { appRoutes } from "@/config/routes";

export function LogTable() {
  return (
    <div className="rounded-3xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-5">
      <EmptyState icon={FileText} title="Use the logs security workspace" description="The legacy log table has been superseded by the integrated logs, audit, and security investigation module." />
      <div className="mt-4 flex justify-center">
        <Link to={appRoutes.logsSecurityOverview}>
          <Button variant="secondary">Open logs workspace</Button>
        </Link>
      </div>
    </div>
  );
}

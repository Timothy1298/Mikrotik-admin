import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { appRoutes } from "@/config/routes";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="surface-card-3d max-w-lg p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-[rgba(139,92,246,0.25)] bg-primary/10 text-primary">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold text-text-primary">Page not found</h1>
        <p className="mt-3 text-sm text-text-secondary">The requested route has not been mapped yet or the URL is invalid.</p>
        <Link to={appRoutes.dashboard}>
          <Button className="mt-6">Return to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

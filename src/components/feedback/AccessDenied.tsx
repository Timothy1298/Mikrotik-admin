import { ShieldAlert } from "lucide-react";

export function AccessDenied() {
  return (
    <div className="surface-card-3d p-10 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-semibold text-text-primary">Access denied</h2>
      <p className="mt-2 text-sm text-text-secondary">Your current role does not allow access to this area.</p>
    </div>
  );
}

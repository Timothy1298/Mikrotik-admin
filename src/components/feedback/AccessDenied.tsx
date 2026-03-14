import { ShieldAlert } from "lucide-react";

export function AccessDenied() {
  return (
    <div className="surface-card-3d p-10 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-[rgba(139,92,246,0.25)] bg-[linear-gradient(90deg,rgba(124,58,237,0.15),rgba(139,92,246,0.06))] text-warning">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-semibold text-white">Access denied</h2>
      <p className="mt-2 text-sm text-slate-400">Your current role does not allow access to this area.</p>
    </div>
  );
}

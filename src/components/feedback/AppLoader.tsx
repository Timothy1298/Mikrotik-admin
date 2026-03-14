import { Shield } from "lucide-react";

export function AppLoader() {
  return (
    <div className="app-grid-bg flex min-h-screen items-center justify-center">
      <div className="surface-card-3d animate-fade-up p-8 text-center">
        <div className="icon-block-highlight mx-auto mb-5 flex h-16 w-16 animate-float-soft items-center justify-center rounded-3xl"><Shield className="h-8 w-8" /></div>
        <h1 className="text-xl font-semibold text-white">Preparing admin console</h1>
        <p className="mt-2 text-sm text-slate-400">Checking session, theme, and application state.</p>
      </div>
    </div>
  );
}

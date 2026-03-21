import { LoaderCircle } from "lucide-react";

export function AppLoader() {
  return (
    <div className="app-grid-bg flex min-h-screen items-center justify-center">
      <div className="surface-card-3d animate-fade-up p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
          <LoaderCircle className="h-7 w-7 animate-spin" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary">Loading...</h1>
        <p className="mt-2 text-sm text-text-secondary">Fetching dashboard state and workspace data.</p>
      </div>
    </div>
  );
}

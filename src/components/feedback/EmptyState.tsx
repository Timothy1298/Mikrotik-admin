import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="surface-card-3d p-8 text-center">
      <div className="icon-block-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">{description}</p>
    </div>
  );
}

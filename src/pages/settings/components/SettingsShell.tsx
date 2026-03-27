import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";

export function SettingsShell({
  title,
  description,
  meta,
  actions,
  children,
}: {
  title: string;
  description: string;
  meta?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title={title} description={description} meta={meta} />
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      <div className="min-w-0 space-y-6 xl:max-h-[calc(100vh-16rem)] xl:overflow-y-auto xl:pr-2">
        {children}
      </div>
    </section>
  );
}

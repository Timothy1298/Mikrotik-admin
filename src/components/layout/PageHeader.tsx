import { Badge } from "@/components/ui/Badge";

export function PageHeader({ eyebrow = "Operations", title, description, meta }: { eyebrow?: string; title: string; description: string; meta?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <Badge tone="info">{eyebrow}</Badge>
        <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400 md:text-base">{description}</p>
      </div>
      {meta ? <p className="text-xs uppercase tracking-[0.25em] text-brand-100 font-mono">{meta}</p> : null}
    </div>
  );
}

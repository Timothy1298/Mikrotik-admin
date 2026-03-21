import { Info } from "lucide-react";

export function InlineInfo({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-2 rounded-2xl border border-primary/30 bg-primary/10 p-3 text-sm text-primary"><Info className="mt-0.5 h-4 w-4 shrink-0" />{children}</div>;
}

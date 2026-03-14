import { Info } from "lucide-react";

export function InlineInfo({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-2 rounded-2xl border border-brand-500/25 bg-[linear-gradient(90deg,rgba(37,99,235,0.12),rgba(56,189,248,0.05))] p-3 text-sm text-brand-100"><Info className="mt-0.5 h-4 w-4 shrink-0" />{children}</div>;
}

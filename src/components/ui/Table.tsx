import { cn } from "@/lib/utils/cn";

export function Table({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-3xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)]"><table className={cn("min-w-full divide-y divide-brand-500/15", className)}>{children}</table></div>;
}
export function TableHead({ children }: { children: React.ReactNode }) { return <thead className="bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(56,189,248,0.05))]">{children}</thead>; }
export function TableHeaderCell({ children, className }: { children: React.ReactNode; className?: string }) { return <th className={cn("px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-slate-500 font-mono", className)}>{children}</th>; }
export function TableBody({ children }: { children: React.ReactNode }) { return <tbody className="divide-y divide-brand-500/15 bg-[rgba(8,14,31,0.9)]">{children}</tbody>; }
export function TableRow({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: React.MouseEventHandler<HTMLTableRowElement> }) { return <tr className={cn("transition hover:bg-[rgba(37,99,235,0.08)]", className)} onClick={onClick}>{children}</tr>; }
export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) { return <td className={cn("px-4 py-4 text-sm text-slate-200", className)}>{children}</td>; }

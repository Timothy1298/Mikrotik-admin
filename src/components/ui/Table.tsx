import { cn } from "@/lib/utils/cn";

export function Table({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-background-border bg-background-panel">
      <table className={cn("min-w-full divide-y divide-background-border", className)}>{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-background-elevated">{children}</thead>;
}

export function TableHeaderCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-4 py-3 text-left font-mono text-xs uppercase tracking-[0.18em] text-text-muted", className)}>
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-background-border bg-background-panel">{children}</tbody>;
}

export function TableRow({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLTableRowElement>;
}) {
  return (
    <tr className={cn("transition-colors hover:bg-background-elevated", className)} onClick={onClick}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-4 text-sm text-text-secondary", className)}>{children}</td>;
}

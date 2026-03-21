import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
  maxWidthClass,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  maxWidthClass?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[linear-gradient(0deg,rgba(8,14,31,0.9),transparent)] p-3 backdrop-blur-sm sm:p-6">
      <div className={cn("surface-card-3d max-h-[calc(100vh-1.5rem)] w-full max-w-[min(96vw,72rem)] animate-fade-up overflow-y-auto p-5 sm:max-h-[calc(100vh-3rem)] sm:p-6", maxWidthClass)}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="break-words text-xl font-semibold text-white">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className={cn("space-y-4")}>{children}</div>
      </div>
    </div>
  );
}

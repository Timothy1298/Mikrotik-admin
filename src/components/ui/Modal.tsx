import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

export function Modal({ open, title, description, children, onClose }: { open: boolean; title: string; description?: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[linear-gradient(0deg,rgba(8,14,31,0.9),transparent)] p-6 backdrop-blur-sm">
      <div className="surface-card-3d w-full max-w-2xl animate-fade-up p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
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

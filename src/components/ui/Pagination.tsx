import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-3">
      <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} leftIcon={<ChevronLeft className="h-4 w-4" />}>
        Previous
      </Button>
      <span className="text-sm text-slate-400 font-mono">Page {page} of {totalPages}</span>
      <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages} rightIcon={<ChevronRight className="h-4 w-4" />}>
        Next
      </Button>
    </div>
  );
}

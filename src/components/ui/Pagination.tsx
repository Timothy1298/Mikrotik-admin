import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-background-border bg-background-panel p-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        leftIcon={<ChevronLeft className="h-4 w-4" />}
      >
        Previous
      </Button>
      <span className="font-mono text-sm text-text-secondary">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        rightIcon={<ChevronRight className="h-4 w-4" />}
      >
        Next
      </Button>
    </div>
  );
}

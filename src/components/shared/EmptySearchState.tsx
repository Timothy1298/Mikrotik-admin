import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";

export function EmptySearchState() {
  return <EmptyState icon={SearchX} title="No results found" description="Try adjusting filters or broadening your search query." />;
}

import { Input } from "@/components/ui/Input";

export function SearchInput({ placeholder = "Search...", leftIcon }: { placeholder?: string; leftIcon?: React.ReactNode }) {
  return <Input placeholder={placeholder} leftIcon={leftIcon} className="w-full min-w-[240px] lg:w-80" />;
}

import type { ComponentProps } from "react";
import { Input } from "@/components/ui/Input";

type SearchInputProps = ComponentProps<typeof Input>;

export function SearchInput({ placeholder = "Search...", leftIcon, className, ...props }: SearchInputProps) {
  return <Input placeholder={placeholder} leftIcon={leftIcon} className={["w-full min-w-[240px] lg:w-80", className].filter(Boolean).join(" ")} {...props} />;
}

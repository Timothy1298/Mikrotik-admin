import { Moon, Monitor, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/ui/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const modes = [
    { value: "dark", icon: Moon },
    { value: "light", icon: Sun },
    { value: "system", icon: Monitor },
  ] as const;

  return (
    <div className="inline-flex rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-1">
      {modes.map(({ value, icon: Icon }) => (
        <Button key={value} variant={theme === value ? "primary" : "ghost"} size="icon" className="h-9 w-9" onClick={() => setTheme(value)}>
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}

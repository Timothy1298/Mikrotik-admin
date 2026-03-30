import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type DropdownItem = {
  label: string;
  onClick?: () => void;
  danger?: boolean;
};

export function Dropdown({
  items,
}: {
  items: DropdownItem[];
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current || !menuRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = 8;

      let left = triggerRect.right - menuRect.width;
      if (left < gap) left = gap;
      if (left + menuRect.width > viewportWidth - gap) {
        left = Math.max(gap, viewportWidth - menuRect.width - gap);
      }

      let top = triggerRect.bottom + gap;
      if (top + menuRect.height > viewportHeight - gap) {
        top = Math.max(gap, triggerRect.top - menuRect.height - gap);
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="inline-block text-left" onClick={(event) => event.stopPropagation()}>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[120] min-w-44 rounded-xl border border-background-border bg-background-panel p-2 shadow-panel"
              style={{ top: position.top, left: position.left }}
              onClick={(event) => event.stopPropagation()}
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpen(false);
                    item.onClick?.();
                  }}
                  className={cn(
                    "flex w-full rounded-lg border border-transparent px-3 py-2 text-left text-sm transition-colors hover:border-primary/20 hover:bg-primary/10",
                    item.danger ? "text-danger" : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

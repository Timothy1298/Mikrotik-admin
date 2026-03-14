import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export function useBreadcrumbs() {
  const location = useLocation();

  return useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => ({
      label: segment.replace(/-/g, " "),
      href: `/${segments.slice(0, index + 1).join("/")}`,
    }));
  }, [location.pathname]);
}

import { useEffect, useState } from "react";
import { themeConfig } from "@/config/theme";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < themeConfig.breakpoints.mobile);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < themeConfig.breakpoints.mobile);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return isMobile;
}

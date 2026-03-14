import type { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { ToastProvider } from "@/app/providers/ToastProvider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <BrowserRouter>
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </BrowserRouter>
    </QueryProvider>
  );
}

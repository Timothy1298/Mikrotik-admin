import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      theme="dark"
      closeButton
      toastOptions={{
        className: "border border-brand-500/15 bg-[rgba(8,14,31,0.9)] text-slate-100",
      }}
    />
  );
}

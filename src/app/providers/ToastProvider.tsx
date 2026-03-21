import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      theme="dark"
      closeButton
      toastOptions={{
        duration: 3200,
        className: "border border-background-border bg-background-panel text-text-primary shadow-panel",
      }}
    />
  );
}

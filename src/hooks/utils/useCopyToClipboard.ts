import { useState } from "react";
import { toast } from "sonner";
import { toastMessages } from "@/lib/constants/toast.constants";

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  async function copy(value: string, successMessage = toastMessages.copied) {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(successMessage);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return { copied, copy };
}

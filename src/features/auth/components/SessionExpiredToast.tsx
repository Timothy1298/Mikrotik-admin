import { toast } from "sonner";
import { toastMessages } from "@/lib/constants/toast.constants";

export function showSessionExpiredToast() {
  toast.error(toastMessages.sessionExpired);
}

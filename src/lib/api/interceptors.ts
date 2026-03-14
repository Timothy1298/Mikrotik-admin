import type { AxiosError, AxiosInstance } from "axios";
import { showSessionExpiredToast } from "@/features/auth/components/SessionExpiredToast";
import { useAuthStore } from "@/app/store/auth.store";
import { ApiError } from "@/lib/api/errors";
import { storageKeys, readStorage, removeStorage } from "@/lib/utils/storage";

let hasShownSessionExpired = false;

function normalizeError(error: AxiosError<{ error?: string; details?: string; message?: string }>) {
  const message =
    error.response?.data?.error ??
    error.response?.data?.message ??
    error.response?.data?.details ??
    error.message ??
    "Request failed";

  return new ApiError(message, error.response?.status, error.response?.data?.details);
}

export function attachInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const token = readStorage(storageKeys.accessToken);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ error?: string; details?: string; message?: string }>) => {
      const hadSessionToken = Boolean(readStorage(storageKeys.accessToken));
      const requestUrl = String(error.config?.url || "");
      const isAuthRequest = requestUrl.includes("/api/auth/");

      if (error.response?.status === 401) {
        removeStorage(storageKeys.accessToken);
        removeStorage(storageKeys.user);
        useAuthStore.getState().clearSession();
        if (hadSessionToken && !isAuthRequest && !hasShownSessionExpired) {
          hasShownSessionExpired = true;
          showSessionExpiredToast();
          window.setTimeout(() => {
            hasShownSessionExpired = false;
          }, 2500);
        }
        return Promise.reject(normalizeError(error));
      }

      return Promise.reject(normalizeError(error));
    },
  );
}

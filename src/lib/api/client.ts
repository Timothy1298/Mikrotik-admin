import axios from "axios";
import { env } from "@/config/env";
import { attachInterceptors } from "@/lib/api/interceptors";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.requestTimeout,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

attachInterceptors(apiClient);

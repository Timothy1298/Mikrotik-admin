import type { Pagination } from "@/types/common";

export type MessageResponse = {
  success: boolean;
  message: string;
};

export type SingleItemResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type ListResponse<T> = {
  success: boolean;
  items: T[];
  message?: string;
};

export type PaginatedResponse<T> = {
  success: boolean;
  items: T[];
  pagination: Pagination;
  message?: string;
};

export type ApiErrorPayload = {
  success?: false;
  error?: string;
  details?: string;
  message?: string;
  statusCode?: number;
};

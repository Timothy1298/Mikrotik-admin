import type { Pagination } from "@/types/common";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
};

export type ListResponse<T> = {
  success: boolean;
  items: T[];
  pagination?: Pagination;
};

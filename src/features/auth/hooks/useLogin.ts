import { useMutation } from "@tanstack/react-query";
import { login } from "@/features/auth/api/login";

export function useLogin() {
  return useMutation({
    mutationFn: login,
  });
}

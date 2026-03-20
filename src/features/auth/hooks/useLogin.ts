import { useMutation } from "@tanstack/react-query";
import { login, verifyTwoFactorLogin } from "@/features/auth/api/login";

export function useLogin() {
  return useMutation({
    mutationFn: login,
  });
}

export function useVerifyTwoFactorLogin() {
  return useMutation({
    mutationFn: verifyTwoFactorLogin,
  });
}

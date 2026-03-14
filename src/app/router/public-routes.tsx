import { Route } from "react-router-dom";
import { RedirectAuthenticated } from "@/app/router/guards";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { appRoutes } from "@/config/routes";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";

export function PublicRoutes() {
  return (
    <Route element={<RedirectAuthenticated />}>
      <Route element={<AuthLayout />}>
        <Route path={appRoutes.login} element={<LoginPage />} />
        <Route path={appRoutes.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={appRoutes.resetPassword} element={<ResetPasswordPage />} />
      </Route>
    </Route>
  );
}

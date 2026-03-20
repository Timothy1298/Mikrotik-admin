import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouterAdminCreateForm } from "@/features/routers/components";
import type { CreateRouterResponse } from "@/features/routers/types/router.types";
import { appRoutes } from "@/config/routes";

export function RouterAddPage() {
  const navigate = useNavigate();

  const handleSuccess = (router: CreateRouterResponse) => {
    navigate(appRoutes.routerDetail(router.id));
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Add Router"
        description="Register a new MikroTik router for a subscriber and generate their WireGuard provisioning config."
        meta="Admin router onboarding"
      />
      <RouterAdminCreateForm mode="page" submitLabel="Create Router" onSuccess={handleSuccess} />
    </section>
  );
}

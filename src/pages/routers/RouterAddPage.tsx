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
        description="Provision a new router from a dedicated page and attach it to an existing customer account."
        meta="Admin router onboarding"
      />
      <RouterAdminCreateForm mode="page" initialTab="direct" submitLabel="Create Router" onSuccess={handleSuccess} />
    </section>
  );
}

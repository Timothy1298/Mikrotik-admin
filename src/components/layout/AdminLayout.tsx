import { Outlet, useLocation } from "react-router-dom";
import { AppContent } from "@/components/layout/AppContent";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export function AdminLayout() {
  const location = useLocation();
  const crumbs = location.pathname.split("/").filter(Boolean);

  return (
    <div className="app-grid-bg h-screen overflow-hidden">
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AppTopbar />
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-6 pt-4 sm:px-4 md:px-5 lg:px-6">
            <div className="mx-auto flex w-full max-w-none flex-col gap-5">
              <Breadcrumbs items={crumbs} />
              <AppContent>
                <Outlet />
              </AppContent>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

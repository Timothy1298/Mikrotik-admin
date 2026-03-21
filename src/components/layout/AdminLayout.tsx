import { Outlet, useLocation } from "react-router-dom";
import { AppContent } from "@/components/layout/AppContent";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export function AdminLayout() {
  const location = useLocation();
  const crumbs = location.pathname.split("/").filter(Boolean);

  return (
    <div className="app-grid-bg min-h-screen bg-background-main text-text-primary">
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden xl:pl-[260px]">
          <AppTopbar />
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-8 pt-4 sm:px-5 lg:px-6">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
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

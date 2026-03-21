import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="app-grid-bg relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16)_0%,transparent_42%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[rgba(15,23,42,0.85)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center">
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

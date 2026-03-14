import { useEffect } from "react";
import { AppLoader } from "@/components/feedback/AppLoader";
import { AppProviders } from "@/app/providers/AppProviders";
import { RouterProvider } from "@/app/providers/RouterProvider";
import { useAppStore } from "@/app/store/app.store";
import { useAuthStore } from "@/app/store/auth.store";

function AppBootstrap() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const hydrated = useAuthStore((state) => state.hydrated);
  const bootstrapped = useAppStore((state) => state.bootstrapped);
  const setBootstrapped = useAppStore((state) => state.setBootstrapped);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated) {
      setBootstrapped(true);
    }
  }, [hydrated, setBootstrapped]);

  if (!hydrated || !bootstrapped) {
    return <AppLoader />;
  }

  return <RouterProvider />;
}

export function App() {
  return (
    <AppProviders>
      <AppBootstrap />
    </AppProviders>
  );
}

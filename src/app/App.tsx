import { useEffect } from "react";
import { AppLoader } from "@/components/feedback/AppLoader";
import { AppProviders } from "@/app/providers/AppProviders";
import { RouterProvider } from "@/app/providers/RouterProvider";
import { useAppStore } from "@/app/store/app.store";
import { useAuthStore } from "@/app/store/auth.store";
import { me } from "@/features/auth/api/me";

function AppBootstrap() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const bootstrapped = useAppStore((state) => state.bootstrapped);
  const setBootstrapped = useAppStore((state) => state.setBootstrapped);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated || bootstrapped) {
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      try {
        const session = await me();
        if (!cancelled) {
          setSession(session.user, session.sessionExpiresAt);
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setBootstrapped(true);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [bootstrapped, clearSession, hydrated, setBootstrapped, setSession]);

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

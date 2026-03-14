import { ErrorState } from "@/components/feedback/ErrorState";

export function NetworkErrorPage() {
  return <ErrorState title="Network unavailable" description="The admin frontend could not reach the backend. Verify API URL, container health, and local network connectivity." />;
}

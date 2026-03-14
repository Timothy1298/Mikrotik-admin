import { ErrorState } from "@/components/feedback/ErrorState";

export function ServerErrorPage() {
  return <ErrorState title="Server error" description="The backend returned an internal error. Review logs or try again after the service stabilizes." />;
}

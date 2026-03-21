import { Search, UserRound } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useUsers } from "@/features/users/hooks";
import type { UserRow } from "@/features/users/types/user.types";

type CustomerSummary = Pick<UserRow, "id" | "name" | "email" | "company" | "accountStatus" | "verificationStatus" | "routersCount">;

export function DiscoveredRouterUserPickerDialog({
  open,
  onClose,
  onSelect,
  selectedUserId,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (user: CustomerSummary) => void;
  selectedUserId?: string;
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const usersQuery = useUsers({
    q: deferredSearch.trim() || undefined,
    page: 1,
    limit: 8,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const items = useMemo(() => usersQuery.data?.items || [], [usersQuery.data?.items]);

  return (
    <Modal
      open={open}
      title="Select Customer"
      description="Choose the platform user who owns this router. The discovery import will link the managed router to that user account."
      onClose={onClose}
      maxWidthClass="max-w-[min(96vw,56rem)]"
    >
      <Input
        label="Search users"
        placeholder="Search by name, email, company, or account details"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {usersQuery.isPending ? <SectionLoader /> : null}
      {usersQuery.isError ? (
        <ErrorState
          title="Unable to load users"
          description="The customer directory could not be loaded. Retry after confirming the admin user routes are reachable."
          onAction={() => void usersQuery.refetch()}
        />
      ) : null}

      {!usersQuery.isPending && !usersQuery.isError && !items.length ? (
        <EmptyState
          icon={UserRound}
          title="No matching customers"
          description="No users matched the current search. Try a different email, company, or customer name."
        />
      ) : null}

      {items.length ? (
        <div className="space-y-3">
          {items.map((user) => {
            const isSelected = user.id === selectedUserId;
            return (
              <button
                key={user.id}
                type="button"
                className={`flex w-full items-start justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition ${
                  isSelected
                    ? "border-primary/40 bg-primary/15"
                    : "border-background-border bg-background-panel hover:border-primary/30 hover:bg-primary/10"
                }`}
                onClick={() => {
                  onSelect({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    company: user.company,
                    accountStatus: user.accountStatus,
                    verificationStatus: user.verificationStatus,
                    routersCount: user.routersCount,
                  });
                  onClose();
                }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{user.name}</p>
                  <p className="mt-1 break-words text-sm text-text-secondary">{user.email}</p>
                  <p className="mt-2 text-xs text-text-muted">{user.company || "No company"} • {user.routersCount} router{user.routersCount === 1 ? "" : "s"}</p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  <Badge tone={user.accountStatus === "active" ? "success" : "danger"}>{user.accountStatus}</Badge>
                  <Badge tone={user.verificationStatus === "verified" ? "success" : "warning"}>{user.verificationStatus}</Badge>
                  {isSelected ? <Badge tone="info">selected</Badge> : null}
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

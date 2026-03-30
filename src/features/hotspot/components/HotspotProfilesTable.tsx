import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data-display/DataTable";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import type { HotspotProfile } from "@/features/hotspot/types/hotspot.types";

export function HotspotProfilesTable({
  rows,
  onAddProfile,
  onEditProfile,
  isLoading,
}: {
  rows: HotspotProfile[];
  onAddProfile: () => void;
  onEditProfile: (profile: HotspotProfile) => void;
  isLoading?: boolean;
}) {
  const columns = useMemo<ColumnDef<HotspotProfile>[]>(() => [
    { header: "Profile", accessorKey: "name" },
    { header: "Rate Limit", cell: ({ row }) => <span className="text-sm text-text-primary">{row.original.rateLimit || "Unlimited"}</span> },
    { header: "Session Timeout", cell: ({ row }) => <span className="text-sm text-text-secondary">{row.original.sessionTimeout || "Not set"}</span> },
    { header: "Idle Timeout", cell: ({ row }) => <span className="text-sm text-text-secondary">{row.original.idleTimeout || "Not set"}</span> },
    { header: "Comment", cell: ({ row }) => <span className="text-sm text-text-secondary">{row.original.comment || "No comment"}</span> },
    {
      header: "Actions",
      cell: ({ row }) => (
        <Dropdown
          items={[
            { label: "Edit source profile", onClick: () => onEditProfile(row.original) },
          ]}
        />
      ),
    },
  ], [onEditProfile]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={onAddProfile}>Add profile</Button>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        emptyTitle="No hotspot profiles found"
        emptyDescription="Hotspot user profiles define the rate-limit source that generates dynamic PCQ-backed queues."
      />
    </div>
  );
}

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data-display/DataTable";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import type { PppoeProfile } from "@/features/pppoe/types/pppoe.types";

export function PppoeProfilesTable({
  rows,
  onAddProfile,
  onEditProfile,
  onDeleteProfile,
  isLoading,
}: {
  rows: PppoeProfile[];
  onAddProfile: () => void;
  onEditProfile: (profile: PppoeProfile) => void;
  onDeleteProfile: (profile: PppoeProfile) => void;
  isLoading?: boolean;
}) {
  const columns = useMemo<ColumnDef<PppoeProfile>[]>(() => [
    { header: "Profile", accessorKey: "name" },
    { header: "Local Address", cell: ({ row }) => <span className="font-mono text-sm text-text-secondary">{row.original.localAddress || "Not set"}</span> },
    { header: "Remote Address", cell: ({ row }) => <span className="font-mono text-sm text-text-secondary">{row.original.remoteAddress || "Not set"}</span> },
    { header: "Rate Limit", cell: ({ row }) => <span className="text-sm text-text-primary">{row.original.rateLimit || "Unlimited"}</span> },
    {
      header: "Actions",
      cell: ({ row }) => (
        <Dropdown
          items={[
            { label: "Edit", onClick: () => onEditProfile(row.original) },
            { label: "Delete", onClick: () => onDeleteProfile(row.original), danger: true },
          ]}
        />
      ),
    },
  ], [onDeleteProfile, onEditProfile]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={onAddProfile}>Add profile</Button>
      </div>
      <DataTable data={rows} columns={columns} isLoading={isLoading} emptyTitle="No PPPoE profiles found" emptyDescription="Create a PPPoE access profile to define rate limits and address assignment for subscribers." />
    </div>
  );
}

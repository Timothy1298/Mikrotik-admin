import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Ticket } from "lucide-react";
import { DataTable } from "@/components/data-display/DataTable";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import { HotspotProfilesBadge } from "@/features/hotspot/components/HotspotProfilesBadge";
import type { HotspotUser } from "@/features/hotspot/types/hotspot.types";
import { formatBytes } from "@/lib/formatters/bytes";
import { formatDateTime } from "@/lib/formatters/date";

export function HotspotUsersTable({
  rows,
  search,
  onSearchChange,
  onAddUser,
  onGenerateVouchers,
  onEditUser,
  onDisconnectUserSession,
  onDeleteUser,
  isLoading,
}: {
  rows: HotspotUser[];
  search: string;
  onSearchChange: (value: string) => void;
  onAddUser: () => void;
  onGenerateVouchers: () => void;
  onEditUser: (user: HotspotUser) => void;
  onDisconnectUserSession: (user: HotspotUser) => void;
  onDeleteUser: (user: HotspotUser) => void;
  isLoading?: boolean;
}) {
  const columns = useMemo<ColumnDef<HotspotUser>[]>(() => [
    {
      header: "Username",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium text-slate-100">{row.original.username}</p>
          <p className="text-xs text-slate-500">{row.original.comment || "No comment"}</p>
        </div>
      ),
    },
    {
      header: "Profile",
      cell: ({ row }) => <HotspotProfilesBadge profile={row.original.profile} />,
    },
    {
      header: "Data used",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="text-sm text-slate-200">IN {formatBytes(row.original.bytesIn || 0)}</p>
          <p className="text-xs text-slate-500">OUT {formatBytes(row.original.bytesOut || 0)}</p>
        </div>
      ),
    },
    {
      header: "Expires at",
      cell: ({ row }) => <span className="font-mono text-sm text-slate-400">{formatDateTime(row.original.expiresAt)}</span>,
    },
    {
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${row.original.online ? "bg-success animate-pulse" : row.original.isActive ? "bg-warning" : "bg-slate-500"}`} />
          <span className="text-sm text-slate-200">{row.original.online ? "online" : row.original.isActive ? "offline" : "disabled"}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <Dropdown
          items={[
            { label: "Edit", onClick: () => onEditUser(row.original) },
            row.original.online ? { label: "Disconnect active session", onClick: () => onDisconnectUserSession(row.original), danger: true } : null,
            { label: "Delete", onClick: () => onDeleteUser(row.original), danger: true },
          ].filter(Boolean) as Array<{ label: string; onClick?: () => void; danger?: boolean }>}
        />
      ),
    },
  ], [onDeleteUser, onDisconnectUserSession, onEditUser]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full max-w-md">
          <Input label="Search users" placeholder="Search username or comment" value={search} onChange={(event) => onSearchChange(event.target.value)} />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" leftIcon={<Ticket className="h-4 w-4" />} onClick={onGenerateVouchers}>Generate vouchers</Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={onAddUser}>Add user</Button>
        </div>
      </div>
      <DataTable data={rows} columns={columns} isLoading={isLoading} emptyTitle="No hotspot users found" emptyDescription="Create a hotspot user or generate vouchers to populate this router hotspot workspace." />
    </div>
  );
}

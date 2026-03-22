import { useMemo } from "react";
import { Ban, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/Table";
import { formatDateTime } from "@/lib/formatters/date";
import type { AddressListEntry } from "@/features/firewall/types/firewall.types";

export function AddressListTable({
  rows,
  listFilter,
  onListFilterChange,
  onAddEntry,
  onBlockSubscriber,
  onRemoveEntry,
}: {
  rows: AddressListEntry[];
  listFilter: string;
  onListFilterChange: (value: string) => void;
  onAddEntry: () => void;
  onBlockSubscriber: () => void;
  onRemoveEntry: (entry: AddressListEntry) => void;
}) {
  const groups = useMemo(() => {
    const grouped = new Map<string, AddressListEntry[]>();
    for (const row of rows) {
      const key = row.list || "unnamed";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(row);
    }
    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full max-w-sm">
          <Input label="List name filter" placeholder="blocked" value={listFilter} onChange={(event) => onListFilterChange(event.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="danger" leftIcon={<Ban className="h-4 w-4" />} onClick={onBlockSubscriber}>Block subscriber</Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={onAddEntry}>Add entry</Button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-background-border bg-background-panel p-6 text-sm text-text-secondary">
          No address list entries found.
        </div>
      ) : groups.map(([listName, entries]) => (
        <div key={listName} className="space-y-3">
          <div className={`rounded-xl border p-3 ${listName === "blocked" ? "border-danger/25 bg-danger/5" : "border-background-border bg-background-panel"}`}>
            <p className={`font-mono text-xs uppercase tracking-[0.18em] ${listName === "blocked" ? "text-danger" : "text-text-muted"}`}>{listName}</p>
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>IP Address</TableHeaderCell>
                <TableHeaderCell>Comment</TableHeaderCell>
                <TableHeaderCell>Added At</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id} className={listName === "blocked" ? "bg-danger/5 hover:bg-danger/10" : undefined}>
                  <TableCell className="font-mono text-xs">{entry.address}</TableCell>
                  <TableCell>{entry.comment || "No comment"}</TableCell>
                  <TableCell>{formatDateTime(entry.creationTime)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" onClick={() => onRemoveEntry(entry)}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}

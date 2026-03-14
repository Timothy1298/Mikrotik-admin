import { Database } from "lucide-react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/Table";

type DataTableProps<T extends object> = {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
};

export function DataTable<T extends object>({ data, columns, isLoading, emptyTitle = "No data", emptyDescription = "There are no rows to display yet.", onRowClick }: DataTableProps<T>) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  if (!isLoading && data.length === 0) {
    return <EmptyState icon={Database} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <Table>
      <TableHead>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => (
              <TableHeaderCell key={header.id}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHeaderCell>
            ))}
          </TableRow>
        ))}
      </TableHead>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} onClick={onRowClick ? () => onRowClick(row.original) : undefined} className={onRowClick ? "cursor-pointer" : undefined}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

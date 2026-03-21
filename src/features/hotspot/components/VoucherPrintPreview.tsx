import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function VoucherPrintPreview({
  vouchers,
}: {
  vouchers: Array<{ username: string; password: string }>;
}) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const rows = [["username", "password"], ...vouchers.map((voucher) => [voucher.username, voucher.password])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "hotspot-vouchers.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-3 print:hidden">
        <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={handleDownloadCsv}>
          Download CSV
        </Button>
        <Button leftIcon={<Printer className="h-4 w-4" />} onClick={handlePrint}>
          Print
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {vouchers.map((voucher) => (
          <div key={`${voucher.username}-${voucher.password}`} className="rounded-2xl border border-background-border bg-background-panel p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Voucher</p>
            <p className="mt-4 text-lg font-semibold text-text-primary">{voucher.username}</p>
            <p className="mt-2 font-mono text-sm text-primary">{voucher.password}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

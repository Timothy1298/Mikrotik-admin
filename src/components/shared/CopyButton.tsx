import { Copy, CopyCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCopyToClipboard } from "@/hooks/utils/useCopyToClipboard";

export function CopyButton({ value }: { value: string }) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <Button variant="ghost" size="icon" onClick={async () => { await copy(value); }}>
      {copied ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

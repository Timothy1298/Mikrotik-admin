import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useInitiateMpesaPayment, useQueryMpesaPayment } from "@/features/billing/hooks/useBilling";

export function MpesaPaymentWidget({
  subscriptionId,
  amount,
  onSuccess,
  onCancel,
}: {
  subscriptionId: string;
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState("");
  const [status, setStatus] = useState<"idle" | "waiting" | "success" | "failed" | "timeout">("idle");
  const [error, setError] = useState("");
  const startedAtRef = useRef<number>(0);

  const initiateMutation = useInitiateMpesaPayment();
  const queryMutation = useQueryMpesaPayment();

  useEffect(() => {
    if (!checkoutRequestId || status !== "waiting") return undefined;

    startedAtRef.current = Date.now();
    const interval = window.setInterval(async () => {
      try {
        const result = await queryMutation.mutateAsync(checkoutRequestId);
        const code = Number(result.result?.ResultCode);
        if (result.status === "completed" || code === 0) {
          window.clearInterval(interval);
          setStatus("success");
          onSuccess?.();
          return;
        }
        if (Date.now() - startedAtRef.current >= 60_000) {
          window.clearInterval(interval);
          setStatus("timeout");
        }
      } catch (err) {
        window.clearInterval(interval);
        setError(err instanceof Error ? err.message : "Failed to query payment");
        setStatus("failed");
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [checkoutRequestId, onSuccess, queryMutation, status]);

  const handleSubmit = async () => {
    try {
      setError("");
      const result = await initiateMutation.mutateAsync({ subscriptionId, phoneNumber, amount });
      setCheckoutRequestId(result.checkoutRequestId);
      setStatus("waiting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate payment");
      setStatus("failed");
    }
  };

  const reset = () => {
    setCheckoutRequestId("");
    setStatus("idle");
    setError("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>M-Pesa Payment</CardTitle>
            <CardDescription>Collect payment with STK Push and recover the subscription from the billing workspace.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <div className="space-y-4">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">
          <div className="flex items-center justify-between gap-3">
            <span>Amount due</span>
            <span className="font-semibold">KES {amount.toFixed(2)}</span>
          </div>
          <p className="mt-2 text-xs text-text-muted">Use <span className="font-mono">2547XXXXXXXX</span> or <span className="font-mono">07XXXXXXXX</span>.</p>
        </div>

        {status === "success" ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Payment confirmed
            </div>
            <p className="mt-2">The subscription payment has been confirmed.</p>
          </div>
        ) : (
          <>
            <Input label="Phone Number" placeholder="2547XXXXXXXX" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
            {status === "waiting" ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                Check your phone for the M-Pesa prompt. This panel will poll for confirmation for up to 60 seconds.
              </div>
            ) : null}
            {error || status === "timeout" ? (
              <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                {error || "No payment confirmation was received in time. Retry the STK push to continue."}
              </div>
            ) : null}
          </>
        )}

        <div className="flex flex-wrap gap-2">
          {status === "idle" || status === "failed" || status === "timeout" ? (
            <Button onClick={() => void handleSubmit()} isLoading={initiateMutation.isPending} disabled={!subscriptionId || !phoneNumber.trim()}>
              Pay with M-Pesa
            </Button>
          ) : null}
          {(status === "failed" || status === "timeout") ? <Button variant="outline" onClick={reset}>Retry</Button> : null}
          {status === "success" ? <Button onClick={onSuccess}>Close</Button> : null}
          {onCancel ? <Button variant="ghost" onClick={onCancel}>Cancel</Button> : null}
        </div>
      </div>
    </Card>
  );
}

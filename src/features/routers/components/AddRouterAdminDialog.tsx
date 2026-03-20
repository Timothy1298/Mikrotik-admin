import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Router, UserRound } from "lucide-react";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useCreateRouterAdmin } from "@/features/routers/hooks/useRouter";
import type { CreateRouterPayload, CreateRouterResponse } from "@/features/routers/types/router.types";

type RouterAdminCreateFormProps = {
  mode?: "dialog" | "page";
  submitLabel?: string;
  onCancel?: () => void;
  onSuccess?: (router: CreateRouterResponse) => void;
  initialUserId?: string;
};

export function RouterAdminCreateForm({
  mode = "dialog",
  submitLabel = "Create Router",
  onCancel,
  onSuccess,
  initialUserId = "",
}: RouterAdminCreateFormProps) {
  const createRouterMutation = useCreateRouterAdmin();
  const [form, setForm] = useState<CreateRouterPayload>({
    userId: initialUserId,
    name: "",
    serverNode: "wireguard",
    reason: "",
  });
  const [inlineError, setInlineError] = useState<string | null>(null);

  useEffect(() => {
    if (createRouterMutation.isIdle || createRouterMutation.isPending) return;
    if (createRouterMutation.isSuccess) {
      setInlineError(null);
    }
  }, [createRouterMutation.isIdle, createRouterMutation.isPending, createRouterMutation.isSuccess]);

  useEffect(() => {
    setForm((current) => ({ ...current, userId: initialUserId }));
  }, [initialUserId]);

  const handleChange = <T extends keyof CreateRouterPayload>(key: T, value: CreateRouterPayload[T]) => {
    setInlineError(null);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInlineError(null);

    if (!form.userId.trim() || !form.name.trim()) {
      setInlineError("Customer user ID and router name are required.");
      return;
    }

    try {
      const router = await createRouterMutation.mutateAsync({
        userId: form.userId.trim(),
        name: form.name.trim(),
        serverNode: form.serverNode?.trim() || "wireguard",
        reason: form.reason?.trim() || undefined,
      });
      setForm({ userId: initialUserId, name: "", serverNode: "wireguard", reason: "" });
      onSuccess?.(router);
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to create router");
    }
  };

  const content = (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 lg:grid-cols-2">
        <Input
          label="Customer User ID"
          placeholder="e.g. 65f8c2... or subscriber@example.com"
          hint="Enter the subscriber's user ID or email."
          value={form.userId}
          onChange={(event) => handleChange("userId", event.target.value)}
          leftIcon={<UserRound className="h-4 w-4" />}
          required
        />
        <Input
          label="Router name"
          placeholder="e.g. branch-office-nairobi"
          value={form.name}
          onChange={(event) => handleChange("name", event.target.value)}
          leftIcon={<Router className="h-4 w-4" />}
          required
        />
      </div>

      <Input
        label="Server node"
        placeholder="wireguard"
        hint="Leave as 'wireguard' unless using multi-node setup."
        value={form.serverNode}
        onChange={(event) => handleChange("serverNode", event.target.value)}
      />

      <Textarea
        label="Admin reason"
        placeholder="Why is this router being created by admin?"
        value={form.reason}
        onChange={(event) => handleChange("reason", event.target.value)}
      />

      {inlineError ? <InlineError message={inlineError} /> : null}

      {createRouterMutation.data ? (
        <div className="rounded-2xl border border-brand-500/20 bg-[rgba(37,99,235,0.08)] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-100">
            <CheckCircle2 className="h-4 w-4" />
            <span>Router provisioned</span>
          </div>
          <div className="mt-3 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
            <p>VPN IP: <span className="font-mono text-slate-100">{createRouterMutation.data.vpnIp}</span></p>
            <p>Status: <span className="text-slate-100">{createRouterMutation.data.status}</span></p>
            <p>Winbox: <span className="font-mono text-slate-100">{createRouterMutation.data.ports.winbox}</span></p>
            <p>SSH/API: <span className="font-mono text-slate-100">{createRouterMutation.data.ports.ssh} / {createRouterMutation.data.ports.api}</span></p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3">
        {onCancel ? <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button> : null}
        <Button type="submit" isLoading={createRouterMutation.isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );

  if (mode === "page") {
    return (
      <Card className="space-y-5">
        <CardHeader>
          <div>
            <CardTitle>Router registration</CardTitle>
            <CardDescription>Assign the router to a subscriber, generate WireGuard access, and reserve management ports.</CardDescription>
          </div>
        </CardHeader>
        {content}
      </Card>
    );
  }

  return content;
}

export function AddRouterAdminDialog({ open, onClose, initialUserId = "" }: { open: boolean; onClose: () => void; initialUserId?: string }) {
  return (
    <Modal
      open={open}
      title="Add Router"
      description="Register a new MikroTik router for a subscriber and generate its WireGuard provisioning config."
      onClose={onClose}
    >
      <RouterAdminCreateForm initialUserId={initialUserId} onCancel={onClose} onSuccess={() => onClose()} />
    </Modal>
  );
}

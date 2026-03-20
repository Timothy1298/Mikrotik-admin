import { useEffect, useMemo, useState, type FormEvent } from "react";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useCreateTicket, useSupportAgents } from "@/features/support/hooks/useSupport";
import type { CreateTicketPayload } from "@/features/support/types/support.types";

const initialState: CreateTicketPayload = {
  userId: "",
  subject: "",
  description: "",
  category: "general",
  priority: "medium",
  assigneeId: "",
  reason: "",
};

export function CreateTicketDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createMutation = useCreateTicket();
  const agentsQuery = useSupportAgents();
  const [form, setForm] = useState<CreateTicketPayload>(initialState);
  const [inlineError, setInlineError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(initialState);
      setInlineError(null);
    }
  }, [open]);

  const assigneeOptions = useMemo(
    () => [
      { label: "Leave unassigned", value: "" },
      ...(agentsQuery.data || []).map((agent) => ({
        label: `${agent.name} · ${agent.supportTeam}`,
        value: agent.id,
      })),
    ],
    [agentsQuery.data],
  );

  const handleChange = <T extends keyof CreateTicketPayload>(key: T, value: CreateTicketPayload[T]) => {
    setInlineError(null);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInlineError(null);
    if (!form.userId?.trim() || !form.subject?.trim() || !form.description?.trim()) {
      setInlineError("Subscriber user ID, subject, and description are required.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        userId: form.userId.trim(),
        subject: form.subject.trim(),
        description: form.description.trim(),
        category: form.category || "general",
        priority: form.priority || "medium",
        assigneeId: form.assigneeId?.trim() || undefined,
        reason: form.reason?.trim() || undefined,
      });
      onClose();
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to create support ticket");
    }
  };

  return (
    <Modal open={open} title="New Ticket" description="Open a support ticket on behalf of a subscriber and optionally assign it immediately." onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Subscriber User ID"
          placeholder="Paste the user's ID"
          hint="Find the user's ID in User Management"
          value={form.userId}
          onChange={(event) => handleChange("userId", event.target.value)}
          required
        />
        <Input
          label="Subject"
          placeholder="e.g. Router offline after power cut"
          value={form.subject}
          onChange={(event) => handleChange("subject", event.target.value)}
          required
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Category"
            value={form.category || "general"}
            onChange={(event) => handleChange("category", event.target.value)}
            options={[
              { label: "Technical", value: "technical" },
              { label: "Billing", value: "billing" },
              { label: "General", value: "general" },
              { label: "Feature Request", value: "feature_request" },
              { label: "Bug Report", value: "bug_report" },
            ]}
          />
          <Select
            label="Priority"
            value={form.priority || "medium"}
            onChange={(event) => handleChange("priority", event.target.value)}
            options={[
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" },
              { label: "Urgent", value: "urgent" },
            ]}
          />
        </div>
        <Textarea
          label="Description"
          rows={4}
          placeholder="Describe the issue in detail..."
          value={form.description}
          onChange={(event) => handleChange("description", event.target.value)}
          required
        />
        <Select
          label="Assign to"
          value={form.assigneeId || ""}
          onChange={(event) => handleChange("assigneeId", event.target.value)}
          options={assigneeOptions}
        />
        <Input
          label="Admin reason"
          value={form.reason || ""}
          onChange={(event) => handleChange("reason", event.target.value)}
        />
        {inlineError ? <InlineError message={inlineError} /> : null}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={createMutation.isPending}>Create Ticket</Button>
        </div>
      </form>
    </Modal>
  );
}

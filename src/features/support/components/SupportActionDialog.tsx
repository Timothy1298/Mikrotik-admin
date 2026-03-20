import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { CannedResponse } from "@/features/support/config/cannedResponses";

export function SupportActionDialog({
  open,
  title,
  description,
  confirmLabel,
  loading,
  reasonOnly = true,
  textarea = false,
  select,
  cannedResponses,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
  reasonOnly?: boolean;
  textarea?: boolean;
  select?: { label: string; value: string; options: Array<{ label: string; value: string }>; onValueChange: (value: string) => void };
  cannedResponses?: CannedResponse[];
  onClose: () => void;
  onConfirm: (payload: { reason?: string; body?: string }) => void;
}) {
  const [reason, setReason] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
      setBody("");
    }
  }, [open]);

  return (
    <Modal open={open} title={title} description={description} onClose={onClose}>
      {select ? <Select label={select.label} value={select.value} onChange={(event) => select.onValueChange(event.target.value)} options={select.options} /> : null}
      {textarea && cannedResponses?.length ? (
        <label className="grid gap-2 text-sm text-slate-200">
          <span className="font-medium text-slate-300">Insert canned response</span>
          <div className="relative">
            <select
              className="h-12 w-full appearance-none rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 text-slate-100 outline-none transition focus:border-brand-500/35"
              defaultValue=""
              onChange={(event) => {
                const selected = cannedResponses.find((item) => item.id === event.target.value);
                if (selected) {
                  setBody(selected.body);
                }
                event.currentTarget.value = "";
              }}
            >
              <option value="">Choose a template</option>
              {[...new Set(cannedResponses.map((item) => item.category))].map((category) => (
                <optgroup key={category} label={category.replace(/_/g, " ")}>
                  {cannedResponses.filter((item) => item.category === category).map((item) => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </label>
      ) : null}
      {textarea ? <Textarea label="Message / note" value={body} onChange={(event) => setBody(event.target.value)} rows={5} /> : null}
      <Input label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional support workflow context" />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={loading} onClick={() => onConfirm({ reason, body })} disabled={textarea && !body.trim() && !reasonOnly}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

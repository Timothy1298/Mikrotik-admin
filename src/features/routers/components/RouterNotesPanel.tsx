import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { RouterDetail } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

export function RouterNotesPanel({ router }: { router: RouterDetail }) {
  const notes = router.notes || [];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Internal notes</CardTitle>
          <CardDescription>Admin-only operational context captured for support and infrastructure follow-up.</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-3">
        {notes.length ? notes.map((note) => (
          <div key={note.id || `${note.author}-${note.createdAt}`} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-100">{note.body}</p>
                <p className="mt-2 text-xs text-slate-500">{note.category} • {note.author}</p>
              </div>
              <span className="font-mono text-xs text-slate-500">{formatDateTime(note.createdAt)}</span>
            </div>
          </div>
        )) : <p className="text-sm text-slate-400">No internal notes have been added for this router yet.</p>}
      </div>
    </Card>
  );
}

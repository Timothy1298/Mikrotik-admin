import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import type { UserDetail } from '@/features/users/types/user.types';
import { formatDateTime } from '@/lib/formatters/date';

export function UserInternalNotesPanel({ user, onAddNote }: { user: UserDetail; onAddNote?: () => void }) {
  const notes = user.notes || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex w-full items-start justify-between gap-3">
          <div><CardTitle>Internal notes</CardTitle><CardDescription>Private operational context for support, billing, and network teams.</CardDescription></div>
          {onAddNote ? <Button variant="outline" onClick={onAddNote}>Add Note</Button> : null}
        </div>
      </CardHeader>
      <div className="space-y-4">
        {notes.length ? notes.map((note, index) => (
          <div key={`${note.createdAt}-${index}`} className="rounded-2xl border border-background-border bg-background-panel p-4">
            <div className="flex items-center justify-between gap-3"><p className="font-medium text-text-primary">{note.category.replace(/_/g, ' ')}</p><p className="font-mono text-xs text-text-muted">{formatDateTime(note.createdAt)}</p></div>
            <p className="mt-2 text-sm text-text-secondary">{note.body}</p>
            <p className="mt-2 font-mono text-xs text-text-muted">{note.author}</p>
          </div>
        )) : <p className="text-sm text-text-secondary">No internal notes yet.</p>}
      </div>
    </Card>
  );
}

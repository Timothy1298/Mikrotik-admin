import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { InlineError } from '@/components/feedback/InlineError';
import { RefreshButton } from '@/components/shared/RefreshButton';
import { SectionLoader } from '@/components/feedback/SectionLoader';
import { useUserNotes } from '@/features/users/hooks';
import type { UserDetail } from '@/features/users/types/user.types';
import { formatDateTime } from '@/lib/formatters/date';

export function UserInternalNotesPanel({ user, onAddNote }: { user: UserDetail; onAddNote?: () => void }) {
  const notesQuery = useUserNotes(user.id);
  const notes = notesQuery.data || user.notes || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex w-full items-start justify-between gap-3">
          <div><CardTitle>Internal notes</CardTitle><CardDescription>Private operational context for support, billing, and network teams.</CardDescription></div>
          <div className="flex items-center gap-2">
            <RefreshButton loading={notesQuery.isFetching} onClick={() => void notesQuery.refetch()} />
            {onAddNote ? <Button variant="outline" onClick={onAddNote}>Add Note</Button> : null}
          </div>
        </div>
      </CardHeader>
      <div className="space-y-4">
        {notesQuery.isPending ? <SectionLoader /> : null}
        {notesQuery.isError ? <InlineError message="Unable to load internal notes." /> : null}
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

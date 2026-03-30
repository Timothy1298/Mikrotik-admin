import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { InlineError } from "@/components/feedback/InlineError";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { useVpnServerNotes } from "@/features/vpn-servers/hooks/useVpnServers";
import type { VpnServerDetail } from "@/features/vpn-servers/types/vpn-server.types";
import { formatDateTime } from "@/lib/formatters/date";

export function VpnServerNotesPanel({ server }: { server: VpnServerDetail }) {
  const notesQuery = useVpnServerNotes(server.id);
  const notes = notesQuery.data || server.notes;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Internal notes</CardTitle>
          <CardDescription>Admin-only infrastructure notes captured for ongoing operations.</CardDescription>
        </div>
        <RefreshButton loading={notesQuery.isFetching} onClick={() => void notesQuery.refetch()} />
      </CardHeader>
      <div className="space-y-3">
        {notesQuery.isPending ? <SectionLoader /> : null}
        {notesQuery.isError ? <InlineError message="Unable to load VPN server notes." /> : null}
        {notes.length ? notes.map((note) => (
          <div key={note.id || `${note.author}-${note.createdAt}`} className="rounded-2xl border border-background-border bg-background-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-text-primary">{note.body}</p>
                <p className="mt-2 text-xs text-text-muted">{note.category} • {note.author}</p>
              </div>
              <span className="font-mono text-xs text-text-muted">{formatDateTime(note.createdAt)}</span>
            </div>
          </div>
        )) : <p className="text-sm text-text-secondary">No internal notes have been added for this server yet.</p>}
      </div>
    </Card>
  );
}

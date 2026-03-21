import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { VpnServerDetail } from "@/features/vpn-servers/types/vpn-server.types";
import { formatDateTime } from "@/lib/formatters/date";

export function VpnServerNotesPanel({ server }: { server: VpnServerDetail }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Internal notes</CardTitle>
          <CardDescription>Admin-only infrastructure notes captured for ongoing operations.</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-3">
        {server.notes.length ? server.notes.map((note) => (
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

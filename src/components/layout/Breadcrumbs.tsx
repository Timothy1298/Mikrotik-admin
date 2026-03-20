import { ArrowLeft, ChevronRight, Home } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { appRoutes } from "@/config/routes";

const routeLabels: Record<string, { label: string; path: string }> = {
  dashboard: { label: "Dashboard", path: appRoutes.dashboard },
  users: { label: "Users", path: appRoutes.users },
  routers: { label: "Routers", path: appRoutes.routers },
  "vpn-servers": { label: "VPN Servers", path: appRoutes.vpnServers },
  monitoring: { label: "Monitoring", path: appRoutes.monitoring },
  billing: { label: "Billing", path: appRoutes.billing },
  "logs-security": { label: "Logs & Security", path: appRoutes.logsSecurityOverview },
  support: { label: "Support", path: appRoutes.supportOverview },
  overview: { label: "Overview", path: appRoutes.supportOverview },
  tickets: { label: "All Tickets", path: appRoutes.supportTickets },
  unassigned: { label: "Unassigned Queue", path: appRoutes.supportUnassigned },
  escalated: { label: "Escalated", path: appRoutes.supportEscalated },
  "high-priority": { label: "High Priority", path: appRoutes.supportHighPriority },
  stale: { label: "Stale / Aging", path: appRoutes.supportStale },
  "by-assignee": { label: "By Assignee", path: appRoutes.supportByAssignee },
  "linked-issues": { label: "Linked Issues", path: appRoutes.supportLinkedIssues },
  conversations: { label: "Conversations", path: appRoutes.supportConversations },
  "notes-flags": { label: "Internal Notes & Flags", path: appRoutes.supportNotesFlags },
  settings: { label: "Settings", path: appRoutes.settings },
  profile: { label: "Profile", path: appRoutes.settings },
  admins: { label: "Admin Accounts", path: appRoutes.settingsAdmins },
  "service-plans": { label: "Service Plans", path: appRoutes.settingsServicePlans },
  resellers: { label: "Resellers", path: appRoutes.settingsResellers },
  audit: { label: "Audit Trail", path: appRoutes.logsSecurityAudit },
  "security-overview": { label: "Security Overview", path: appRoutes.logsSecuritySecurityOverview },
  "security-events": { label: "Security Events", path: appRoutes.logsSecuritySecurityEvents },
  "suspicious-activity": { label: "Suspicious Activity", path: appRoutes.logsSecuritySuspiciousActivity },
  sessions: { label: "Sessions", path: appRoutes.logsSecuritySessions },
  "user-security-review": { label: "User Security Review", path: appRoutes.logsSecurityUserSecurityReview },
  "resource-timelines": { label: "Resource Timelines", path: appRoutes.logsSecurityResourceTimelines },
  "reviews-notes": { label: "Reviews & Notes", path: appRoutes.logsSecurityReviewsNotes },
  system: { label: "System", path: appRoutes.settingsSystem },
  activity: { label: "Activity", path: appRoutes.logsSecurityActivity },
  invoices: { label: "Invoices", path: appRoutes.billingInvoices },
  subscriptions: { label: "Subscriptions", path: appRoutes.billingSubscriptions },
};

function prettify(part: string) {
  const mapped = routeLabels[part];
  if (mapped) return mapped.label;
  if (/^[a-f0-9]{20,}$/i.test(part)) return `Record ${part.slice(0, 8)}`;
  return part.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function Breadcrumbs({ items }: { items: string[] }) {
  const navigate = useNavigate();
  const location = useLocation();

  const crumbs = items.map((item, index) => {
    const path = `/${items.slice(0, index + 1).join("/")}`;
    return {
      label: prettify(item),
      path,
      active: index === items.length - 1,
    };
  });

  const quickLinks = [
    { label: "Dashboard", path: appRoutes.dashboard },
    { label: "Users", path: appRoutes.users },
    { label: "Routers", path: appRoutes.routers },
  ].filter((link) => link.path !== location.pathname);

  return (
    <div className="flex flex-col gap-2 border-b border-brand-500/15 pb-2.5 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px]" onClick={() => navigate(-1)} leftIcon={<ArrowLeft className="h-3 w-3" />}>
          Back
        </Button>
        <nav className="flex min-w-0 flex-wrap items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-slate-500 font-mono">
          <Link to={appRoutes.dashboard} className="inline-flex items-center gap-1 rounded-full px-1.5 py-1 text-slate-400 transition hover:bg-[rgba(37,99,235,0.08)] hover:text-white">
            <Home className="h-2.5 w-2.5" />
            Home
          </Link>
          {crumbs.map((item, index) => (
            <span key={`${item.path}-${index}`} className="inline-flex min-w-0 items-center gap-1">
              <ChevronRight className="h-2.5 w-2.5 text-brand-500/35" />
              {item.active ? (
                <span className="truncate rounded-full border border-brand-500/15 bg-[linear-gradient(90deg,rgba(37,99,235,0.12),rgba(56,189,248,0.05))] px-1.5 py-1 text-slate-200">{item.label}</span>
              ) : (
                <Link to={item.path} className="truncate rounded-full px-1.5 py-1 transition hover:bg-[rgba(37,99,235,0.08)] hover:text-white">
                  {item.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {quickLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="rounded-full border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-2.5 py-1 text-[10px] font-medium text-slate-300 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)] hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

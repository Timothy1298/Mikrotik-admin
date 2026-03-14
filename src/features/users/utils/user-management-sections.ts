import { appRoutes } from '@/config/routes';
import type { UsersQuery } from '@/features/users/types/user.types';

export type UserManagementSection =
  | 'all'
  | 'active'
  | 'trials'
  | 'suspended'
  | 'verification'
  | 'billing-risk'
  | 'security-review'
  | 'support-impact'
  | 'internal-notes';

export const userManagementSections: Record<UserManagementSection, {
  title: string;
  description: string;
  route: string;
  lockedFilters?: Partial<UsersQuery>;
  emptyTitle: string;
  emptyDescription: string;
}> = {
  all: {
    title: 'All users',
    description: 'Search, filter, and act on the full customer directory across access, billing, support, and operational health.',
    route: appRoutes.usersAll,
    emptyTitle: 'No users found',
    emptyDescription: 'No customer accounts match the current filters.',
  },
  active: {
    title: 'Active users',
    description: 'Focus on healthy and currently enabled accounts with live access to platform services.',
    route: appRoutes.usersActive,
    lockedFilters: { accountStatus: 'active' },
    emptyTitle: 'No active users found',
    emptyDescription: 'No enabled accounts match the current active-user filters.',
  },
  trials: {
    title: 'Trial users',
    description: 'Track trial-stage accounts, conversion risk, router footprint, and extension opportunities.',
    route: appRoutes.usersTrials,
    lockedFilters: { subscriptionStatus: 'trial' },
    emptyTitle: 'No trial users found',
    emptyDescription: 'There are no trial accounts matching the current filters.',
  },
  suspended: {
    title: 'Suspended users',
    description: 'Review suspended accounts, restore access where appropriate, and inspect the operational context behind the suspension.',
    route: appRoutes.usersSuspended,
    lockedFilters: { accountStatus: 'suspended' },
    emptyTitle: 'No suspended users found',
    emptyDescription: 'No suspended accounts match the current filters.',
  },
  verification: {
    title: 'Verification queue',
    description: 'Review accounts awaiting email verification or onboarding review and resolve them with minimal friction.',
    route: appRoutes.usersVerificationQueue,
    lockedFilters: { verificationStatus: 'unverified' },
    emptyTitle: 'Verification queue is clear',
    emptyDescription: 'There are no unverified users matching the current filters.',
  },
  'billing-risk': {
    title: 'Billing risk',
    description: 'Surface overdue, grace-period, and conversion-risk accounts that need billing follow-up before service impact grows.',
    route: appRoutes.usersBillingRisk,
    lockedFilters: { billingState: 'overdue' },
    emptyTitle: 'No billing-risk users found',
    emptyDescription: 'There are no overdue billing accounts matching the current filters.',
  },
  'security-review': {
    title: 'Security review',
    description: 'Investigate users with suspicious activity, repeated failures, or operational risk flags requiring attention.',
    route: appRoutes.usersSecurityReview,
    lockedFilters: { riskStatus: 'flagged' },
    emptyTitle: 'No security review items found',
    emptyDescription: 'There are no flagged accounts requiring security review right now.',
  },
  'support-impact': {
    title: 'Support impact',
    description: 'Prioritize users with current ticket load, repeated issues, or active operational support burden.',
    route: appRoutes.usersSupportImpact,
    lockedFilters: { supportState: 'has_open_tickets' },
    emptyTitle: 'No support impact users found',
    emptyDescription: 'There are no users with active support impact under the current filters.',
  },
  'internal-notes': {
    title: 'Internal notes / flags',
    description: 'Track manually reviewed accounts, user flags, and the operational context captured by internal admin notes.',
    route: appRoutes.usersInternalNotes,
    emptyTitle: 'No flagged users found',
    emptyDescription: 'There are no flagged or watched accounts under the current filters.',
  },
};

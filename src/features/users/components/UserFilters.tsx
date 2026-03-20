import { Search } from 'lucide-react';
import { FilterBar } from '@/components/shared/FilterBar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { UsersQuery } from '@/features/users/types/user.types';

export function UserFilters({
  filters,
  onChange,
  hiddenFields = [],
}: {
  filters: UsersQuery;
  onChange: (patch: Partial<UsersQuery>) => void;
  hiddenFields?: Array<keyof UsersQuery>;
}) {
  const isHidden = (field: keyof UsersQuery) => hiddenFields.includes(field);

  return (
    <FilterBar
      left={
        <div className="space-y-4">
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-7">
            <Input value={filters.q || ''} onChange={(event) => onChange({ q: event.target.value || undefined, page: 1 })} placeholder="Search name, email, company, phone" leftIcon={<Search className="h-4 w-4" />} />
            {!isHidden('accountStatus') ? <Select value={filters.accountStatus || ''} onChange={(event) => onChange({ accountStatus: event.target.value || undefined, page: 1 })} options={[{ label: 'All account statuses', value: '' }, { label: 'Active', value: 'active' }, { label: 'Suspended', value: 'suspended' }, { label: 'Pending verification', value: 'pending_verification' }]} /> : null}
            {!isHidden('verificationStatus') ? <Select value={filters.verificationStatus || ''} onChange={(event) => onChange({ verificationStatus: event.target.value || undefined, page: 1 })} options={[{ label: 'All verification states', value: '' }, { label: 'Verified', value: 'verified' }, { label: 'Unverified', value: 'unverified' }]} /> : null}
            {!isHidden('subscriptionStatus') ? <Select value={filters.subscriptionStatus || ''} onChange={(event) => onChange({ subscriptionStatus: event.target.value || undefined, page: 1 })} options={[{ label: 'All subscription states', value: '' }, { label: 'Trial', value: 'trial' }, { label: 'Active', value: 'active' }, { label: 'Past due', value: 'past_due' }, { label: 'Canceled', value: 'canceled' }, { label: 'Expired', value: 'expired' }]} /> : null}
            {!isHidden('supportState') ? <Select value={filters.supportState || ''} onChange={(event) => onChange({ supportState: event.target.value || undefined, page: 1 })} options={[{ label: 'All support states', value: '' }, { label: 'Has open tickets', value: 'has_open_tickets' }, { label: 'No tickets', value: 'no_tickets' }]} /> : null}
            {!isHidden('billingState') ? <Select value={filters.billingState || ''} onChange={(event) => onChange({ billingState: event.target.value || undefined, page: 1 })} options={[{ label: 'All billing states', value: '' }, { label: 'Current', value: 'current' }, { label: 'Overdue', value: 'overdue' }, { label: 'None', value: 'none' }]} /> : null}
            {!isHidden('riskStatus') ? <Select value={filters.riskStatus || ''} onChange={(event) => onChange({ riskStatus: event.target.value || undefined, page: 1 })} options={[{ label: 'All risk states', value: '' }, { label: 'Normal', value: 'normal' }, { label: 'Watchlist', value: 'watchlist' }, { label: 'Flagged', value: 'flagged' }]} /> : null}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {!isHidden('routerOwnershipState') ? <Select value={filters.routerOwnershipState || ''} onChange={(event) => onChange({ routerOwnershipState: event.target.value || undefined, page: 1 })} options={[{ label: 'All router ownership', value: '' }, { label: 'No routers', value: 'none' }, { label: 'Has routers', value: 'has_routers' }, { label: 'Has offline routers', value: 'has_offline_routers' }]} /> : null}
            <Input type="date" label="Created from" value={filters.createdFrom || ''} onChange={(event) => onChange({ createdFrom: event.target.value || undefined, page: 1 })} />
            <Input type="date" label="Created to" value={filters.createdTo || ''} onChange={(event) => onChange({ createdTo: event.target.value || undefined, page: 1 })} />
            <div className="flex items-end">
              <Button variant="ghost" disabled={!filters.createdFrom && !filters.createdTo} onClick={() => onChange({ createdFrom: undefined, createdTo: undefined, page: 1 })}>
                Clear dates
              </Button>
            </div>
          </div>
        </div>
      }
    />
  );
}

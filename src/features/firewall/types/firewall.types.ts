export type FilterRule = {
  id: string;
  routerosId: string;
  chain: string;
  action: string;
  protocol: string;
  srcAddress: string;
  dstAddress: string;
  dstPort: string;
  inInterface: string;
  comment: string;
  disabled: boolean;
};

export type NatRule = {
  id: string;
  routerosId: string;
  chain: string;
  action: string;
  protocol: string;
  dstPort: string;
  toAddresses: string;
  toPorts: string;
  comment: string;
  disabled: boolean;
};

export type AddressListEntry = {
  id: string;
  routerosId: string;
  list: string;
  address: string;
  comment: string;
  creationTime: string | null;
};

export type FilterRulePayload = {
  chain: string;
  action: string;
  protocol?: string;
  srcAddress?: string;
  dstAddress?: string;
  dstPort?: string;
  inInterface?: string;
  comment?: string;
};

export type NatRulePayload = {
  chain: string;
  action: string;
  protocol?: string;
  dstPort?: string;
  toAddresses?: string;
  toPorts?: string;
  comment?: string;
};

export type AddressListPayload = {
  list: string;
  address: string;
  comment?: string;
};

export type BlockSubscriberPayload = {
  ipAddress: string;
  reason?: string;
};

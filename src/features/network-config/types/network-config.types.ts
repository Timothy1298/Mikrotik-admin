export type DhcpLease = {
  routerosId: string;
  address: string;
  macAddress: string;
  hostname: string;
  status: string;
  expiresAt: string | null;
  activeAddress: string;
  clientId: string;
};

export type WirelessClient = {
  macAddress: string;
  interface: string;
  signal: number;
  txRate: string;
  rxRate: string;
  uptime: string;
  bytes: number;
  packets: number;
};

export type NetworkInterface = {
  name: string;
  type: string;
  mtu: number;
  macAddress: string;
  running: boolean;
  disabled: boolean;
  rxBytes: number;
  txBytes: number;
};

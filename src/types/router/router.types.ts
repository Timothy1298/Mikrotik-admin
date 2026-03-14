export type RouterStatus = "pending" | "active" | "inactive" | "offline";

export type RouterSummary = {
  id: string;
  name: string;
  status: RouterStatus;
  address: string;
  lastSeen?: string | null;
  ownerName?: string;
};

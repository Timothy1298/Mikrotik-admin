export type AdminSearchResult = {
  id: string;
  type: "user" | "router" | "ticket" | "vpn_server";
  resourceId: string;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
};

export type AdminNotification = {
  id: string;
  category: string;
  title: string;
  body: string;
  tone: string;
  href: string;
  createdAt: string;
  read: boolean;
};

export type BackupTrigger = "manual" | "auto" | "pre-change";

export type RouterBackup = {
  id: string;
  routerId: string;
  filename: string;
  exportText?: string;
  sizeBytes: number;
  triggeredBy: BackupTrigger;
  createdBy: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type RouterBackupsResponse = {
  items: RouterBackup[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

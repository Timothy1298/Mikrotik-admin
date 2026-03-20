export type AdminAccount = {
  id: string;
  name: string;
  email: string;
  adminRole: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type CreateAdminPayload = {
  name: string;
  email: string;
  password: string;
  adminRole: string;
  reason?: string;
};

export type UpdateAdminPayload = {
  name?: string;
  adminRole?: string;
  reason?: string;
};

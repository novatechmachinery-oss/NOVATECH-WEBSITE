import type { Lead, Machine, UserRecord } from "@/types/machine";

export type ProfileSettings = {
  fullName: string;
  phone: string;
  email: string;
};

export type SmtpSettings = {
  host: string;
  port: string;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  useSsl: boolean;
};

export type TrackingSettings = {
  googleAnalyticsId: string;
  metaPixelId: string;
  microsoftClarityId: string;
};

export type SecuritySettings = {
  passwordHash: string;
  passwordUpdatedAt: string | null;
};

export type AdminSettings = {
  profile: ProfileSettings;
  smtp: SmtpSettings;
  tracking: TrackingSettings;
  security: SecuritySettings;
};

export type WorkspaceSnapshot = {
  version: string;
  exportedAt: string;
  machines: Machine[];
  categories: string[];
  subcategoryMap: Record<string, string[]>;
  leads: Lead[];
  users: UserRecord[];
  settings: AdminSettings;
};

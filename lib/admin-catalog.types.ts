export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminMachine = {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  inventoryNumber?: string;
  countryOfOrigin?: string;
  price?: number | null;
  condition: "new" | "used" | "refurbished";
  stockStatus: "available" | "reserved" | "sold" | "in_maintenance" | "in_transit";
  machineType: "conventional" | "cnc";
  description?: string;
  categoryId: string;
  specialDeal: boolean;
  images: string[];
  specifications: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type AdminCatalogSnapshot = {
  categories: AdminCategory[];
  machines: AdminMachine[];
  lastSyncedAt: string | null;
};

export type AdminCategoryInput = {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
};

export type AdminMachineInput = {
  id?: string;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  inventoryNumber?: string;
  countryOfOrigin?: string;
  price?: number | null;
  condition?: AdminMachine["condition"];
  stockStatus?: AdminMachine["stockStatus"];
  machineType?: AdminMachine["machineType"];
  description?: string;
  categoryId: string;
  specialDeal?: boolean;
  images?: string[];
  specifications?: Record<string, string>;
};

export type DashboardMetric = {
  label: string;
  value: number;
  hint: string;
};

export type DashboardCategoryBreakdown = {
  id: string;
  name: string;
  machineCount: number;
  subcategoryCount: number;
  barWidth: number;
};

export type DashboardLeadRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  machineInterested: string;
  createdAt: string;
};

export type AdminDashboardData = {
  metrics: DashboardMetric[];
  categories: DashboardCategoryBreakdown[];
  recentMachines: AdminMachine[];
  machinesAddedToday: number;
  todayMachines: AdminMachine[];
  recentLeads: DashboardLeadRecord[];
};

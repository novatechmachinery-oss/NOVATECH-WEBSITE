export type MachineCategory = {
  id: string;
  name: string;
  slug?: string;
  parentId?: string;
  sub?: string[];
  count: number;
};

export type MachineItem = {
  id: string;
  title: string;
  category: string;
  categorySlug?: string;
  categoryId?: string;
  subcategory?: string;
  subcategorySlug?: string;
  subcategoryId?: string;
  machineType: "conventional" | "cnc";
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
  location: string;
  description: string;
  manufacturer?: string;
  model?: string;
  condition?: string;
  stockNumber?: string;
  referenceNumber?: number;
  support?: string;
  images?: string[];
  imagePositions?: string[];
  isSpecialDeal?: boolean;
  dealBadge?: string;
  dealDescription?: string;
  createdAt?: string;
  updatedAt?: string;
  specifications?: Array<{ label: string; value: string }>;
};

export type MachineSearchItem = Pick<
  MachineItem,
  "id" | "title" | "category" | "subcategory" | "manufacturer" | "model"
>;

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description?: string | null;
  image_url?: string | null;
  created_at?: string;
};

export type MachineRow = {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  description: string | null;
  condition: string | null;
  country_of_origin: string | null;
  inventory_number: string | null;
  serial_number: string | null;
  machine_type: string | null;
  special_deal: boolean | null;
  featured: boolean | null;
  images: string[] | null;
  specifications: unknown;
  created_at: string;
  updated_at?: string | null;
  stock_status: string | null;
  category_id: string | null;
};


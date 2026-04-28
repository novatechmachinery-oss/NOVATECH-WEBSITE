import { supabase } from "@/lib/supabase";
import type { Machine } from "@/types/machine";

/** Convert snake_case DB row to camelCase Machine type */
function toMachine(row: Record<string, unknown>): Machine {
  return {
    id: row.id as string,
    name: row.name as string,
    brand: row.brand as string,
    model: row.model as string,
    serialNumber: row.serial_number as string,
    countryOfOrigin: row.country_of_origin as string,
    price: Number(row.price),
    category: row.category as string,
    subcategory: row.subcategory as string,
    condition: row.condition as string,
    stockStatus: row.stock_status as string,
    machineType: row.machine_type as string,
    description: row.description as string,
    specifications: (row.specifications as { key: string; value: string }[]) ?? [],
    images: (row.images as string[]) ?? [],
  };
}

export type MachineFilters = {
  search?: string;
  category?: string;
  subcategory?: string;
  condition?: string;
  stockStatus?: string;
  machineType?: string;
  isPublished?: boolean;
};

export type CreateMachineValues = {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  countryOfOrigin: string;
  price: number;
  category: string;
  subcategory: string;
  condition: string;
  stockStatus: string;
  machineType: string;
  description: string;
  specifications: { key: string; value: string }[];
  images: string[];
  isPublished: boolean;
  isSpecialDeal: boolean;
};

export const machineRepository = {
  async findAll(filters: MachineFilters = {}): Promise<Machine[]> {
    let query = supabase.from("machines").select("*").order("created_at", { ascending: false });

    if (filters.isPublished !== undefined) {
      query = query.eq("is_published", filters.isPublished);
    }
    if (filters.category) {
      query = query.eq("category", filters.category);
    }
    if (filters.subcategory) {
      query = query.eq("subcategory", filters.subcategory);
    }
    if (filters.condition) {
      query = query.eq("condition", filters.condition);
    }
    if (filters.stockStatus) {
      query = query.eq("stock_status", filters.stockStatus);
    }
    if (filters.machineType) {
      query = query.eq("machine_type", filters.machineType);
    }
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map(toMachine);
  },

  async findById(id: string): Promise<Machine | null> {
    const { data, error } = await supabase
      .from("machines")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    return data ? toMachine(data) : null;
  },

  async create(values: CreateMachineValues): Promise<Machine> {
    const { data, error } = await supabase
      .from("machines")
      .insert({
        id: values.id,
        name: values.name,
        brand: values.brand,
        model: values.model,
        serial_number: values.serialNumber,
        country_of_origin: values.countryOfOrigin,
        price: values.price,
        category: values.category,
        subcategory: values.subcategory,
        condition: values.condition,
        stock_status: values.stockStatus,
        machine_type: values.machineType,
        description: values.description,
        specifications: values.specifications,
        images: values.images,
        is_published: values.isPublished,
        is_special_deal: values.isSpecialDeal,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toMachine(data);
  },

  async update(
    id: string,
    values: Partial<{
      name: string;
      brand: string;
      model: string;
      serialNumber: string;
      countryOfOrigin: string;
      price: number;
      category: string;
      subcategory: string;
      condition: string;
      stockStatus: string;
      machineType: string;
      description: string;
      specifications: { key: string; value: string }[];
      images: string[];
      isPublished: boolean;
      isSpecialDeal: boolean;
    }>
  ): Promise<Machine> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (values.name !== undefined) patch.name = values.name;
    if (values.brand !== undefined) patch.brand = values.brand;
    if (values.model !== undefined) patch.model = values.model;
    if (values.serialNumber !== undefined) patch.serial_number = values.serialNumber;
    if (values.countryOfOrigin !== undefined) patch.country_of_origin = values.countryOfOrigin;
    if (values.price !== undefined) patch.price = values.price;
    if (values.category !== undefined) patch.category = values.category;
    if (values.subcategory !== undefined) patch.subcategory = values.subcategory;
    if (values.condition !== undefined) patch.condition = values.condition;
    if (values.stockStatus !== undefined) patch.stock_status = values.stockStatus;
    if (values.machineType !== undefined) patch.machine_type = values.machineType;
    if (values.description !== undefined) patch.description = values.description;
    if (values.specifications !== undefined) patch.specifications = values.specifications;
    if (values.images !== undefined) patch.images = values.images;
    if (values.isPublished !== undefined) patch.is_published = values.isPublished;
    if (values.isSpecialDeal !== undefined) patch.is_special_deal = values.isSpecialDeal;

    const { data, error } = await supabase
      .from("machines")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toMachine(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("machines").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async getStats() {
    const { data: machines, error } = await supabase
      .from("machines")
      .select("stock_status, is_published");

    if (error) throw new Error(error.message);

    const all = machines ?? [];
    return {
      totalMachines: all.length,
      availableMachines: all.filter((m) => m.stock_status === "In Stock").length,
      reservedMachines: all.filter((m) => m.stock_status === "Limited").length,
    };
  },

  async bulkCreate(machines: CreateMachineValues[]): Promise<void> {
    for (const args of machines) {
      await machineRepository.create(args);
    }
  },
};

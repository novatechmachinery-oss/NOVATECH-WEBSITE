import { supabase } from "@/lib/supabase";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  createdAt: string;
};

function toCategory(row: Record<string, unknown>): CategoryRow {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    parentId: row.parent_id as string | null,
    description: (row.description as string) ?? "",
    createdAt: row.created_at as string,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const categoryRepository = {
  async findAll(): Promise<CategoryRow[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(toCategory);
  },

  async findById(id: string): Promise<CategoryRow | null> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    return data ? toCategory(data) : null;
  },

  async findTopLevel(): Promise<CategoryRow[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .is("parent_id", null)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(toCategory);
  },

  async findSubcategoriesOf(parentId: string): Promise<CategoryRow[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("parent_id", parentId)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(toCategory);
  },

  async create(values: {
    name: string;
    slug?: string;
    parentId?: string | null;
    description?: string;
  }): Promise<CategoryRow> {
    const slug = values.slug ?? slugify(values.name);
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: values.name,
        slug,
        parent_id: values.parentId ?? null,
        description: values.description ?? "",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCategory(data);
  },

  async update(id: string, values: Partial<{ name: string; slug: string; parentId: string | null; description: string }>): Promise<CategoryRow> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (values.name !== undefined) patch.name = values.name;
    if (values.slug !== undefined) patch.slug = values.slug;
    if (values.parentId !== undefined) patch.parent_id = values.parentId;
    if (values.description !== undefined) patch.description = values.description;

    const { data, error } = await supabase
      .from("categories")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCategory(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  /** Returns array of category names (for dropdowns in admin) */
  async getNames(): Promise<string[]> {
    const rows = await categoryRepository.findTopLevel();
    return rows.map((r) => r.name);
  },

  /** Returns subcategory map { categoryName: subcategoryName[] } */
  async getSubcategoryMap(): Promise<Record<string, string[]>> {
    const { data, error } = await supabase
      .from("categories")
      .select("name, parent_id, categories!parent_id(name)")
      .not("parent_id", "is", null);

    if (error) throw new Error(error.message);

    const map: Record<string, string[]> = {};
    for (const row of data ?? []) {
      const parentName = ((row as unknown) as { categories?: { name: string } | null }).categories?.name;
      if (parentName) {
        if (!map[parentName]) map[parentName] = [];
        map[parentName].push(row.name);
      }
    }
    return map;
  },
};

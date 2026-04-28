import { supabase } from "@/lib/supabase";
import type { UserRecord } from "@/types/machine";

function toUserRecord(row: Record<string, unknown>): UserRecord {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: (row.phone as string) ?? "",
    role: (row.role as string) ?? "Sales",
    joined: (row.joined as string) ?? "",
  };
}

export const userRepository = {
  async findAll(): Promise<UserRecord[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(toUserRecord);
  },

  async findById(id: string): Promise<UserRecord | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    return data ? toUserRecord(data) : null;
  },

  async findByEmail(email: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    return data;
  },

  async create(values: {
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    passwordHash?: string;
  }): Promise<UserRecord> {
    const { data, error } = await supabase
      .from("users")
      .insert({
        name: values.name,
        email: values.email ?? null,
        phone: values.phone ?? "",
        role: values.role ?? "Sales",
        password_hash: values.passwordHash ?? "",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toUserRecord(data);
  },

  async update(id: string, values: Partial<{
    name: string;
    email: string;
    phone: string;
    role: string;
    passwordHash: string;
    isActive: boolean;
  }>): Promise<UserRecord> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (values.name !== undefined) patch.name = values.name;
    if (values.email !== undefined) patch.email = values.email;
    if (values.phone !== undefined) patch.phone = values.phone;
    if (values.role !== undefined) patch.role = values.role;
    if (values.passwordHash !== undefined) patch.password_hash = values.passwordHash;
    if (values.isActive !== undefined) patch.is_active = values.isActive;

    const { data, error } = await supabase
      .from("users")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toUserRecord(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};

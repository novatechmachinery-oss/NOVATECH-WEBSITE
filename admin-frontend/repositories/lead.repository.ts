import { supabase } from "@/lib/supabase";
import type { Lead, LeadStage } from "@/types/machine";

function toLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    name: row.name as string,
    company: (row.company as string) ?? "",
    interestedIn: (row.interested_in as string) ?? "",
    stage: row.stage as LeadStage,
  };
}

export const leadRepository = {
  async findAll(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(toLead);
  },

  async findById(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    return data ? toLead(data) : null;
  },

  async create(values: {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    interestedIn?: string;
    message?: string;
    stage?: LeadStage;
    source?: string;
  }): Promise<Lead> {
    const { data, error } = await supabase
      .from("leads")
      .insert({
        name: values.name,
        company: values.company ?? "",
        email: values.email ?? "",
        phone: values.phone ?? "",
        interested_in: values.interestedIn ?? "",
        message: values.message ?? "",
        stage: values.stage ?? "New",
        source: values.source ?? "admin",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toLead(data);
  },

  async update(id: string, values: Partial<{
    name: string;
    company: string;
    email: string;
    phone: string;
    interestedIn: string;
    message: string;
    stage: LeadStage;
  }>): Promise<Lead> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (values.name !== undefined) patch.name = values.name;
    if (values.company !== undefined) patch.company = values.company;
    if (values.email !== undefined) patch.email = values.email;
    if (values.phone !== undefined) patch.phone = values.phone;
    if (values.interestedIn !== undefined) patch.interested_in = values.interestedIn;
    if (values.message !== undefined) patch.message = values.message;
    if (values.stage !== undefined) patch.stage = values.stage;

    const { data, error } = await supabase
      .from("leads")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toLead(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async getStageCount(stage: LeadStage): Promise<number> {
    const { count, error } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("stage", stage);

    if (error) throw new Error(error.message);
    return count ?? 0;
  },

  async getPipeline() {
    const stages: LeadStage[] = ["New", "Contacted", "Quotation", "Negotiation", "Won", "Lost"];
    const counts = await Promise.all(
      stages.map(async (stage) => ({
        stage,
        count: await leadRepository.getStageCount(stage),
      }))
    );
    return counts;
  },
};

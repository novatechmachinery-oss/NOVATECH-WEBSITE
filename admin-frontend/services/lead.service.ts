import { leadRepository } from "@/repositories/lead.repository";
import type { Lead, LeadStage } from "@/types/machine";

export const leadService = {
  async list(): Promise<Lead[]> {
    return leadRepository.findAll();
  },

  async get(id: string): Promise<Lead | null> {
    return leadRepository.findById(id);
  },

  async create(values: { name: string; company?: string; email?: string; phone?: string; interestedIn?: string; message?: string; stage?: LeadStage; source?: string }) {
    return leadRepository.create(values);
  },

  async update(id: string, values: Partial<{ name: string; company: string; email: string; phone: string; interestedIn: string; message: string; stage: LeadStage }>) {
    return leadRepository.update(id, values);
  },

  async delete(id: string): Promise<void> {
    return leadRepository.delete(id);
  },

  async getPipeline() {
    return leadRepository.getPipeline();
  },
};

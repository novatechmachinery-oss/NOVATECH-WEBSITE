import { supabase } from "@/lib/supabase";
import type { AdminSettings } from "@/types/settings";

const SETTINGS_ID = "global";

const defaultSettings: AdminSettings = {
  profile: { fullName: "Admin Novatech Machinery", phone: "+91 9646255855", email: "admin@novatechmachinery.com" },
  smtp: { host: "smtp.gmail.com", port: "587", username: "admin@novatechmachinery.com", password: "", fromEmail: "info@novatechmachinery.com", fromName: "Novatech Machinery", useSsl: false },
  tracking: { googleAnalyticsId: "G-P6982NCZTC", metaPixelId: "1254549116261073", microsoftClarityId: "w8fhp8peo" },
  security: { passwordHash: "", passwordUpdatedAt: null },
};

function toSettings(row: Record<string, unknown>): AdminSettings {
  return {
    profile: { ...defaultSettings.profile, ...(row.profile as object) },
    smtp: { ...defaultSettings.smtp, ...(row.smtp as object) },
    tracking: { ...defaultSettings.tracking, ...(row.tracking as object) },
    security: { ...defaultSettings.security, ...(row.security as object) },
  };
}

export const settingsRepository = {
  async get(): Promise<AdminSettings> {
    const { data, error } = await supabase.from("admin_settings").select("*").eq("id", SETTINGS_ID).single();
    if (error) { if (error.code === "PGRST116") return defaultSettings; throw new Error(error.message); }
    return data ? toSettings(data) : defaultSettings;
  },

  async update(patch: Partial<AdminSettings>): Promise<AdminSettings> {
    const current = await settingsRepository.get();
    const merged: AdminSettings = {
      profile: { ...current.profile, ...(patch.profile ?? {}) },
      smtp: { ...current.smtp, ...(patch.smtp ?? {}) },
      tracking: { ...current.tracking, ...(patch.tracking ?? {}) },
      security: { ...current.security, ...(patch.security ?? {}) },
    };
    const { data, error } = await supabase.from("admin_settings")
      .upsert({ id: SETTINGS_ID, ...merged, updated_at: new Date().toISOString() })
      .select().single();
    if (error) throw new Error(error.message);
    return toSettings(data);
  },

  async updateSecurity(passwordHash: string): Promise<AdminSettings> {
    return settingsRepository.update({ security: { passwordHash, passwordUpdatedAt: new Date().toISOString() } });
  },
};

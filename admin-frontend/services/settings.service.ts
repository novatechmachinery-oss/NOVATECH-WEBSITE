import { settingsRepository } from "@/repositories/settings.repository";
import type { AdminSettings } from "@/types/settings";

async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buffer = new TextEncoder().encode(password.trim());
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return password;
}

export const settingsService = {
  async get(): Promise<AdminSettings> {
    return settingsRepository.get();
  },

  async updateProfile(profile: AdminSettings["profile"]) {
    return settingsRepository.update({ profile });
  },

  async updateSmtp(smtp: AdminSettings["smtp"]) {
    return settingsRepository.update({ smtp });
  },

  async updateTracking(tracking: AdminSettings["tracking"]) {
    return settingsRepository.update({ tracking });
  },

  async changePassword(password: string) {
    const passwordHash = await hashPassword(password);
    return settingsRepository.updateSecurity(passwordHash);
  },

  async sendTestEmail(recipientEmail: string, smtp: AdminSettings["smtp"]) {
    const required = [smtp.host, smtp.port, smtp.username, smtp.password, smtp.fromEmail, smtp.fromName];
    if (required.some((v) => !v.trim())) {
      return { ok: false, message: "SMTP configuration is incomplete. Please fill all fields first." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return { ok: false, message: "Please enter a valid recipient email address." };
    }
    // In production, integrate nodemailer or Resend here
    return { ok: true, message: `Test email queued for ${recipientEmail}. Connect an SMTP library to deliver.` };
  },

  getActiveTrackingCount(tracking: AdminSettings["tracking"]): number {
    return Object.values(tracking).filter(Boolean).length;
  },
};

import { userRepository } from "@/repositories/user.repository";
import type { UserRecord } from "@/types/machine";

async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buffer = new TextEncoder().encode(password.trim());
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return password; // fallback (shouldn't happen in Node)
}

export const userService = {
  async list(): Promise<UserRecord[]> {
    return userRepository.findAll();
  },

  async get(id: string): Promise<UserRecord | null> {
    return userRepository.findById(id);
  },

  async create(values: { name: string; email?: string; phone?: string; role?: string; password?: string }) {
    const passwordHash = values.password ? await hashPassword(values.password) : "";
    return userRepository.create({ ...values, passwordHash });
  },

  async update(id: string, values: Partial<{ name: string; email: string; phone: string; role: string; password: string }>) {
    const { password, ...rest } = values;
    const passwordHash = password ? await hashPassword(password) : undefined;
    return userRepository.update(id, { ...rest, ...(passwordHash ? { passwordHash } : {}) });
  },

  async delete(id: string): Promise<void> {
    return userRepository.delete(id);
  },

  async verifyPassword(email: string, password: string): Promise<{ id: string; role: string } | null> {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.password_hash) return null;
    const hash = await hashPassword(password);
    if (hash !== user.password_hash) return null;
    return { id: user.id, role: user.role };
  },
};

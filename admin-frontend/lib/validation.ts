import { z } from "zod";

// ============================================================
// MACHINE SCHEMAS
// ============================================================
export const MachineSpecificationSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

export const CreateMachineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().default(""),
  model: z.string().default(""),
  serialNumber: z.string().default(""),
  countryOfOrigin: z.string().default(""),
  price: z.number().nonnegative().default(0),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().default(""),
  condition: z.enum(["New", "Used", "Refurbished"]).default("Used"),
  stockStatus: z.enum(["In Stock", "Limited", "Out of Stock"]).default("In Stock"),
  machineType: z.enum(["CNC", "Conventional"]).default("Conventional"),
  description: z.string().default(""),
  specificationsText: z.string().default(""),
  imagesText: z.string().default(""),
  isPublished: z.boolean().default(true),
  isSpecialDeal: z.boolean().default(false),
});

export const UpdateMachineSchema = CreateMachineSchema.partial();

// ============================================================
// CATEGORY SCHEMAS
// ============================================================
export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1).optional(),
  parentId: z.string().uuid().nullable().optional(),
  description: z.string().default(""),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

// ============================================================
// LEAD SCHEMAS
// ============================================================
export const LeadStageEnum = z.enum(["New", "Contacted", "Quotation", "Negotiation", "Won", "Lost"]);

export const CreateLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().default(""),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().default(""),
  interestedIn: z.string().default(""),
  message: z.string().default(""),
  stage: LeadStageEnum.default("New"),
  source: z.string().default("website"),
});

export const UpdateLeadSchema = CreateLeadSchema.partial();

// ============================================================
// USER SCHEMAS
// ============================================================
export const UserRoleEnum = z.enum(["Super Admin", "Admin", "Sales", "Viewer"]);

export const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().default(""),
  role: UserRoleEnum.default("Sales"),
  password: z.string().min(8).optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial();

// ============================================================
// AUTH SCHEMAS
// ============================================================
export const LoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const ChangePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ============================================================
// SETTINGS SCHEMAS
// ============================================================
export const ProfileSettingsSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().default(""),
  email: z.string().email().optional().or(z.literal("")),
});

export const SmtpSettingsSchema = z.object({
  host: z.string().default(""),
  port: z.string().default("587"),
  username: z.string().default(""),
  password: z.string().default(""),
  fromEmail: z.string().default(""),
  fromName: z.string().default(""),
  useSsl: z.boolean().default(false),
});

export const TrackingSettingsSchema = z.object({
  googleAnalyticsId: z.string().default(""),
  metaPixelId: z.string().default(""),
  microsoftClarityId: z.string().default(""),
});

export const UpdateSettingsSchema = z.object({
  profile: ProfileSettingsSchema.optional(),
  smtp: SmtpSettingsSchema.optional(),
  tracking: TrackingSettingsSchema.optional(),
});

export const TestEmailSchema = z.object({
  recipientEmail: z.string().email("Valid email is required"),
});

// ============================================================
// SEO SCHEMAS
// ============================================================
export const SeoPageSchema = z.object({
  path: z.string().min(1),
  pageTitle: z.string().min(1),
  metaTitle: z.string().default(""),
  metaDescription: z.string().default(""),
  keywords: z.string().default(""),
  canonicalUrl: z.string().default(""),
  ogTitle: z.string().default(""),
  ogDescription: z.string().default(""),
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
});

export const UpdateSeoPageSchema = SeoPageSchema.partial();

export const SeoGlobalSchema = z.object({
  siteName: z.string().min(1),
  siteUrl: z.string().url(),
  titleSuffix: z.string().default(""),
  defaultMetaDescription: z.string().default(""),
  defaultKeywords: z.string().default(""),
  defaultOgImage: z.string().default(""),
  twitterHandle: z.string().default(""),
});

export const SeoTemplateSchema = z.object({
  machineTitleTemplate: z.string(),
  machineDescriptionTemplate: z.string(),
  categoryTitleTemplate: z.string(),
  categoryDescriptionTemplate: z.string(),
});

// ============================================================
// CONTACT ENQUIRY SCHEMA
// ============================================================
export const ContactEnquirySchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().default(""),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().min(1, "Message is required"),
});

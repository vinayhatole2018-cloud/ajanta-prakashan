import { z } from "zod";
import { isSafeHttpsUrlOrLocalPath } from "@/utils/url";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || isSafeHttpsUrlOrLocalPath(v), "Must be a valid https:// URL");

export const settingsSchema = z.object({
  websiteName: z.string().trim().min(2, "Website name is required"),
  description: z.string().trim().default(""),
  logoUrl: optionalUrl.transform((v) => (v ? v : null)),
  contactEmail: z.string().trim().email("Enter a valid email"),
  contactPhone: z.string().trim().default(""),
  address: z.string().trim().default(""),
  whatsappUrl: optionalUrl.transform((v) => (v ? v : null)),
  socialLinks: z
    .object({
      facebook: optionalUrl,
      instagram: optionalUrl,
      linkedin: optionalUrl,
      twitter: optionalUrl,
      youtube: optionalUrl,
    })
    .default({}),
  footerText: z.string().trim().default(""),
  privacyPolicy: z.string().trim().default(""),
  terms: z.string().trim().default(""),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

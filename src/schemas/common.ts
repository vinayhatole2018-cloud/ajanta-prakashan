import { z } from "zod";
import { isSafeHttpsUrlOrLocalPath } from "@/utils/url";

export const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || isSafeHttpsUrlOrLocalPath(v), "Must be a valid https:// URL");

/** Digits only, with country code (e.g. "919579260877") — the shape wa.me links need. */
export const optionalPhone = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || /^[0-9]{10,15}$/.test(v), "Digits only, with country code (e.g. 919579260877)");

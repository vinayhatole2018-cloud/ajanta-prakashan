import { z } from "zod";
import { optionalUrl } from "./common";
import { isSafeHttpsUrlOrLocalPath } from "@/utils/url";

export const landingImageSchema = z.object({
  imageUrl: z
    .string()
    .trim()
    .min(1, "Image URL is required")
    .refine(isSafeHttpsUrlOrLocalPath, "Must be a valid https:// URL"),
  caption: z.string().trim().max(200).default(""),
  linkUrl: optionalUrl.transform((v) => (v ? v : null)),
  displayOrder: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
  showAsPopup: z.boolean().default(false),
});

export type LandingImageFormValues = z.infer<typeof landingImageSchema>;

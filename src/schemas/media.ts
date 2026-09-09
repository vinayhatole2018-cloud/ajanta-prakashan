import { z } from "zod";
import { MEDIA_TYPES, type MediaType } from "@/types/Media";
import { isSafeHttpsUrlOrLocalPath } from "@/utils/url";

export const mediaSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  type: z.enum(MEDIA_TYPES as [MediaType, ...MediaType[]]),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .refine(isSafeHttpsUrlOrLocalPath, "Must be a valid https:// URL"),
  conferenceId: z.string().trim().nullable().default(null),
});

export type MediaFormValues = z.infer<typeof mediaSchema>;

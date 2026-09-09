import { z } from "zod";

export const DESIGNATION_OPTIONS = ["Principal", "Professor", "Associate Professor", "Assistant Professor", "Scholar", "Other"] as const;

export const registrationSchema = z.object({
  fullName: z.string().trim().min(3, "Full name must be at least 3 characters").max(120),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email address")]).optional(),
  city: z.string().trim().min(2, "City is required").max(100),
  designation: z.enum(DESIGNATION_OPTIONS, { message: "Select a designation" }),
  institution: z.string().trim().min(2, "Institution is required").max(200),
  state: z.string().trim().max(100).optional(),
  notificationEnabled: z.boolean().default(true),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;

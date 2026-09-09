import { z } from "zod";
import { optionalPhone, optionalUrl } from "./common";

export const conferenceTrackSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1, "Track title is required"),
  disciplines: z.array(z.string().trim().min(1)).default([]),
});

export const conferenceSubThemeGroupSchema = z.object({
  id: z.string(),
  category: z.string().trim().min(1, "Category is required"),
  items: z.array(z.string().trim().min(1)).default([]),
});

export const registrationFeeSchema = z.object({
  category: z.string().trim().min(1, "Category is required"),
  amount: z.coerce.number().min(0, "Amount must be 0 or more"),
  currency: z.string().trim().min(1).default("INR"),
  notes: z.string().trim().optional(),
});

export const importantDateSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  date: z.string().trim().min(1, "Date is required"),
});

export const paperGuidelinesSchema = z.object({
  font: z.string().trim().default("Times New Roman"),
  fontSize: z.string().trim().default("12pt"),
  lineSpacing: z.string().trim().default("1.5"),
  fileFormat: z.string().trim().default("MS Word (.doc/.docx)"),
  marginLeft: z.string().trim().default("1.5 inch"),
  marginRight: z.string().trim().default("1 inch"),
  maxWords: z.string().trim().default("2000"),
  requiredFields: z.array(z.string().trim().min(1)).default([]),
  referenceStyle: z.string().trim().default("APA"),
  plagiarismLimit: z.string().trim().default("Below 10%"),
  submissionNote: z.string().trim().default(""),
  awards: z.string().trim().default(""),
  journalName: z.string().trim().optional(),
  journalIssn: z.string().trim().optional(),
  journalImpactFactor: z.string().trim().optional(),
});

export const paymentInformationSchema = z.object({
  accountName: z.string().trim().min(1, "Account name is required"),
  accountNumber: z.string().trim().min(1, "Account number is required"),
  bank: z.string().trim().min(1, "Bank is required"),
  branch: z.string().trim().min(1, "Branch is required"),
  ifsc: z.string().trim().min(1, "IFSC code is required"),
  paymentQrUrl: optionalUrl.transform((v) => (v ? v : null)),
  upiId: z.string().trim().optional(),
  upiMobile: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const conferenceSchema = z.object({
  title: z.string().trim().min(3, "Title is required"),
  theme: z.string().trim().default(""),
  description: z.string().trim().default(""),

  date: z.string().trim().min(1, "Date is required"),
  startTime: z.string().trim().default(""),
  endTime: z.string().trim().default(""),

  venue: z.string().trim().min(1, "Venue is required"),
  address: z.string().trim().default(""),
  city: z.string().trim().default(""),
  state: z.string().trim().default(""),

  mode: z.enum(["online", "offline", "hybrid"]).default("offline"),

  organizer: z.string().trim().min(1, "Organizer is required"),
  coOrganizer: z.string().trim().default(""),

  brochureUrl: optionalUrl.transform((v) => (v ? v : null)),

  registrationUrl: optionalUrl.transform((v) => (v ? v : null)),
  paperSubmissionUrl: optionalUrl.transform((v) => (v ? v : null)),
  whatsappUrl: optionalUrl.transform((v) => (v ? v : null)),
  whatsappNumber: optionalPhone.transform((v) => (v ? v : null)),
  websiteUrl: optionalUrl.transform((v) => (v ? v : null)),

  contactEmail: z.union([z.literal(""), z.string().trim().email()]).optional(),
  contactPhone: z.string().trim().optional(),

  objectives: z.array(z.string().trim().min(1)).default([]),
  tracks: z.array(conferenceTrackSchema).default([]),
  subThemes: z.array(conferenceSubThemeGroupSchema).default([]),

  registrationFees: z.array(registrationFeeSchema).default([]),
  importantDates: z.array(importantDateSchema).default([]),
  paperGuidelines: paperGuidelinesSchema.nullable().default(null),
  paymentInformation: paymentInformationSchema.nullable().default(null),

  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export type ConferenceFormValues = z.infer<typeof conferenceSchema>;

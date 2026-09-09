import type { ContentStatus, ImportantDate, PaymentInformation, RegistrationFee } from "./common";

export type ConferenceMode = "online" | "offline" | "hybrid";

export interface ConferenceTrack {
  id: string;
  title: string;
  disciplines: string[];
}

export interface ConferenceSubThemeGroup {
  id: string;
  category: string;
  items: string[];
}

export interface PaperGuidelines {
  font: string;
  fontSize: string;
  lineSpacing: string;
  fileFormat: string;
  marginLeft: string;
  marginRight: string;
  maxWords: string;
  requiredFields: string[];
  referenceStyle: string;
  plagiarismLimit: string;
  submissionNote: string;
  awards: string;
  journalName: string | null;
  journalIssn: string | null;
  journalImpactFactor: string | null;
}

export interface Conference {
  id: string;
  title: string;
  theme: string;
  description: string;

  date: string; // ISO date, e.g. "2026-04-25"
  startTime: string;
  endTime: string;

  venue: string;
  address: string;
  city: string;
  state: string;

  mode: ConferenceMode;

  organizer: string;
  coOrganizer: string;

  brochureUrl: string | null;

  registrationUrl: string | null;
  paperSubmissionUrl: string | null;
  whatsappUrl: string | null;
  /** Phone number (e.g. "919579260877") the post-registration WhatsApp redirect opens, with a pre-filled message. Distinct from whatsappUrl, which is a "join the group" invite link. */
  whatsappNumber: string | null;
  websiteUrl: string | null;

  contactEmail: string | null;
  contactPhone: string | null;

  objectives: string[];
  tracks: ConferenceTrack[];
  subThemes: ConferenceSubThemeGroup[];

  registrationFees: RegistrationFee[];
  importantDates: ImportantDate[];
  paperGuidelines: PaperGuidelines | null;
  paymentInformation: PaymentInformation | null;

  status: ContentStatus;

  createdAt: unknown;
  updatedAt: unknown;
}

export type ConferenceInput = Omit<Conference, "id" | "createdAt" | "updatedAt">;

import { z } from "zod";
import { COMMITTEE_CATEGORIES, type CommitteeCategory } from "@/types/Committee";

export const committeeMemberSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  designation: z.string().trim().default(""),
  institution: z.string().trim().default(""),
  category: z.enum(COMMITTEE_CATEGORIES as [CommitteeCategory, ...CommitteeCategory[]]),
  displayOrder: z.coerce.number().int().default(0),
  conferenceId: z.string().trim().min(1, "Conference is required"),
});

export type CommitteeMemberFormValues = z.infer<typeof committeeMemberSchema>;

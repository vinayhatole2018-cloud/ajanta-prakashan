export type CommitteeCategory =
  | "Patrons"
  | "Advisory Committee"
  | "Conference Chairperson"
  | "IQAC Coordinators"
  | "Conference Coordinators"
  | "Conference Secretary"
  | "Organising Committee"
  | "Technical Committee"
  | "Editorial Committee"
  | "Track Committee";

export const COMMITTEE_CATEGORIES: CommitteeCategory[] = [
  "Patrons",
  "Advisory Committee",
  "Conference Chairperson",
  "IQAC Coordinators",
  "Conference Coordinators",
  "Conference Secretary",
  "Organising Committee",
  "Technical Committee",
  "Editorial Committee",
  "Track Committee",
];

export interface CommitteeMember {
  id: string;
  name: string;
  designation: string;
  institution: string;
  category: CommitteeCategory;
  displayOrder: number;
  conferenceId: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export type CommitteeMemberInput = Omit<CommitteeMember, "id" | "createdAt" | "updatedAt">;

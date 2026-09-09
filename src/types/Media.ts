export type MediaType = "banner" | "poster" | "brochure" | "logo" | "payment_qr" | "other";

export const MEDIA_TYPES: MediaType[] = ["banner", "poster", "brochure", "logo", "payment_qr", "other"];

export interface MediaRecord {
  id: string;
  title: string;
  type: MediaType;
  url: string;
  conferenceId: string | null;
  createdAt: unknown;
  updatedAt: unknown;
}

export type MediaInput = Omit<MediaRecord, "id" | "createdAt" | "updatedAt">;

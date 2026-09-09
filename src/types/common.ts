export type ContentStatus = "draft" | "published" | "archived";

export interface ImportantDate {
  label: string;
  date: string; // ISO date string, e.g. "2026-04-10"
}

export interface RegistrationFee {
  category: string;
  amount: number;
  currency: string;
  notes?: string;
}

export interface PaymentInformation {
  accountName: string;
  accountNumber: string;
  bank: string;
  branch: string;
  ifsc: string;
  paymentQrUrl: string | null;
  upiId: string | null;
  upiMobile: string | null;
  notes: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  /** Opaque cursor to pass back in as `after` for the next page. */
  cursor: string | null;
}

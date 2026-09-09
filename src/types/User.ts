export interface RegisteredUser {
  id: string;
  fullName: string;
  mobile: string;
  email: string | null;
  city: string;
  designation: string;
  institution: string;
  state: string | null;
  notificationEnabled: boolean;
  createdAt: unknown;
  updatedAt: unknown;
}

export type RegisteredUserInput = Omit<RegisteredUser, "id" | "createdAt" | "updatedAt">;

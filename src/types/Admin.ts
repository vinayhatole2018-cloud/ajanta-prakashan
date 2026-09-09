export interface AdminAccount {
  uid: string;
  email: string;
  role: "admin";
  active: boolean;
  createdAt: unknown;
}

export type AdminLogAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "ARCHIVE"
  | "PUBLISH"
  | "UNPUBLISH";

export interface AdminLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: AdminLogAction;
  resource: string;
  resourceId: string;
  timestamp: unknown;
}

import { AdminRoute } from "@/components/admin/AdminRoute";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminRoute>{children}</AdminRoute>;
}

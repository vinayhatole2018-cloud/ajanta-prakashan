"use client";

import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { signOutAdmin } from "@/firebase/auth";
import { logAdminAction } from "@/services/adminService";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { admin } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    if (admin) {
      await logAdminAction({
        adminUid: admin.uid,
        adminEmail: admin.email,
        action: "LOGOUT",
        resource: "admin",
        resourceId: admin.uid,
      }).catch(() => {});
    }
    await signOutAdmin();
    router.replace("/admin");
  }

  return (
    <div className="flex min-h-screen bg-ink-50">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">
          <AdminSidebar onLogout={handleLogout} />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">
            <AdminSidebar onNavigate={() => setMobileOpen(false)} onLogout={handleLogout} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-ink-200 bg-white px-4 lg:hidden">
          <span className="text-sm font-semibold text-ink-900">Ajanta Prakashan Admin</span>
          <button onClick={() => setMobileOpen((v) => !v)} className="rounded-md p-2 text-ink-700 hover:bg-ink-100" aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

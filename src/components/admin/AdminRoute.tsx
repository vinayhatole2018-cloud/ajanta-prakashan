"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AdminShell } from "./AdminShell";

/**
 * Gates every /admin/* page except the login screen itself. Never renders
 * protected content until Firebase auth state AND admin authorization
 * (admins/{uid}.active && role === "admin") have both been confirmed.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { status } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "signed-out" || status === "unauthorized") {
      router.replace("/admin");
    }
  }, [status, router]);

  if (status !== "authorized") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ink-950 text-ink-300">
        <ShieldCheck className="h-8 w-8 animate-pulse text-brand-400" />
        <p className="text-sm">Verifying administrator access…</p>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}

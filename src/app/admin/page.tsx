import { ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-ink-500">Ajanta Prakashan</p>
          <p className="text-xs text-ink-400">Administrator Panel</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}

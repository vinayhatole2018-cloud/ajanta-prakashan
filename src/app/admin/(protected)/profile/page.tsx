"use client";

import { Mail, ShieldCheck, UserCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { resetAdminPassword } from "@/firebase/auth";
import { useToast } from "@/contexts/ToastContext";

export default function AdminProfilePage() {
  const { admin } = useAdminAuth();
  const toast = useToast();

  async function sendReset() {
    if (!admin) return;
    try {
      await resetAdminPassword(admin.email);
      toast.success("Password reset email sent.");
    } catch {
      toast.error("Failed to send reset email.");
    }
  }

  return (
    <div>
      <PageHeader title="Admin Profile" description="Your administrator account details." />
      <Card className="max-w-md p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <UserCircle className="h-8 w-8" />
          </div>
          <div>
            <p className="font-medium text-ink-900">{admin?.email}</p>
            <Badge tone={admin?.active ? "success" : "danger"} className="mt-1">
              {admin?.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-ink-400" />
            <dt className="text-ink-500">Email:</dt>
            <dd className="text-ink-900">{admin?.email}</dd>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-ink-400" />
            <dt className="text-ink-500">Role:</dt>
            <dd className="capitalize text-ink-900">{admin?.role}</dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-ink-400">
          Your authorization role cannot be changed from this panel. Contact another administrator to modify access.
        </p>

        <Button variant="outline" className="mt-6" onClick={sendReset}>
          Send Password Reset Email
        </Button>
      </Card>
    </div>
  );
}

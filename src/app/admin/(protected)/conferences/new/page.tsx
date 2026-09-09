"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConferenceForm, conferenceToFormValues, formValuesToConferenceInput, type ConferenceFormValues } from "@/components/admin/ConferenceForm";
import { useToast } from "@/contexts/ToastContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { createConference } from "@/services/conferenceService";
import { logAdminAction } from "@/services/adminService";

export default function NewConferencePage() {
  const router = useRouter();
  const toast = useToast();
  const { admin } = useAdminAuth();
  const [submitting, setSubmitting] = useState(false);

  async function save(values: ConferenceFormValues, status: "draft" | "published") {
    setSubmitting(true);
    try {
      const input = formValuesToConferenceInput({ ...values, status });
      const id = await createConference(input);
      if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "CREATE", resource: "conferences", resourceId: id });
      toast.success(status === "published" ? "Conference published." : "Conference saved as draft.");
      router.push("/admin/conferences");
    } catch {
      toast.error("Failed to save conference.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Add Conference" description="Create a new conference. Save as draft or publish immediately." />
      <ConferenceForm
        defaultValues={conferenceToFormValues(null)}
        submitting={submitting}
        onCancel={() => router.push("/admin/conferences")}
        onSaveAsDraft={(v) => save(v, "draft")}
        onSubmit={(v) => save(v, "published")}
      />
    </div>
  );
}

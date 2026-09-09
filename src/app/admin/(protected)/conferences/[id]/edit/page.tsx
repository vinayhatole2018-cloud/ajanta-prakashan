"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConferenceForm, conferenceToFormValues, formValuesToConferenceInput, type ConferenceFormValues } from "@/components/admin/ConferenceForm";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorState } from "@/components/common/ErrorState";
import { useToast } from "@/contexts/ToastContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { getConferenceById, updateConference } from "@/services/conferenceService";
import { logAdminAction } from "@/services/adminService";
import type { Conference } from "@/types";

export default function EditConferencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const { admin } = useAdminAuth();
  const [conference, setConference] = useState<Conference | null | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getConferenceById(id).then(setConference);
  }, [id]);

  async function save(values: ConferenceFormValues, status: "draft" | "published" | undefined) {
    setSubmitting(true);
    try {
      const input = formValuesToConferenceInput(status ? { ...values, status } : values);
      await updateConference(id, input);
      if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "UPDATE", resource: "conferences", resourceId: id });
      toast.success("Conference updated successfully.");
      router.push("/admin/conferences");
    } catch {
      toast.error("Failed to update conference.");
    } finally {
      setSubmitting(false);
    }
  }

  if (conference === undefined) return <LoadingSpinner label="Loading conference…" />;
  if (conference === null) return <ErrorState message="Conference not found." />;

  return (
    <div>
      <PageHeader title="Edit Conference" description={conference.title} />
      <ConferenceForm
        defaultValues={conferenceToFormValues(conference)}
        submitting={submitting}
        onCancel={() => router.push("/admin/conferences")}
        onSaveAsDraft={(v) => save(v, "draft")}
        onSubmit={(v) => save(v, "published")}
      />
    </div>
  );
}

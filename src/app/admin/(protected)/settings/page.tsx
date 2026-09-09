"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/common/Button";
import { FormField, Input, Textarea } from "@/components/common/FormControls";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/contexts/ToastContext";
import { settingsSchema, type SettingsFormValues } from "@/schemas/settings";
import { DEFAULT_SETTINGS, getSiteSettings, updateSiteSettings } from "@/services/settingsService";

export default function AdminSettingsPage() {
  const toast = useToast();
  const [loaded, setLoaded] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({ resolver: zodResolver(settingsSchema), defaultValues: DEFAULT_SETTINGS });

  useEffect(() => {
    getSiteSettings().then((s) => {
      reset(s);
      setLoaded(true);
    });
  }, [reset]);

  async function onSubmit(values: SettingsFormValues) {
    try {
      await updateSiteSettings(values);
      toast.success("Settings updated.");
    } catch {
      toast.error("Failed to update settings.");
    }
  }

  if (!loaded) return <LoadingSpinner label="Loading settings…" />;

  return (
    <div>
      <PageHeader title="Website Settings" description="Site-wide information shown across the public website." />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
        <FormField label="Website Name" htmlFor="websiteName" required error={errors.websiteName?.message}>
          <Input id="websiteName" invalid={!!errors.websiteName} {...register("websiteName")} />
        </FormField>
        <FormField label="Description" htmlFor="description">
          <Textarea id="description" rows={3} {...register("description")} />
        </FormField>
        <FormField label="Logo URL" htmlFor="logoUrl" hint="Only https:// URLs are accepted." error={errors.logoUrl?.message}>
          <Input id="logoUrl" placeholder="https://..." {...register("logoUrl")} />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Contact Email" htmlFor="contactEmail" required error={errors.contactEmail?.message}>
            <Input id="contactEmail" type="email" invalid={!!errors.contactEmail} {...register("contactEmail")} />
          </FormField>
          <FormField label="Contact Phone" htmlFor="contactPhone">
            <Input id="contactPhone" {...register("contactPhone")} />
          </FormField>
        </div>
        <FormField label="Address" htmlFor="address">
          <Textarea id="address" rows={2} {...register("address")} />
        </FormField>
        <FormField label="WhatsApp URL" htmlFor="whatsappUrl" error={errors.whatsappUrl?.message}>
          <Input id="whatsappUrl" placeholder="https://chat.whatsapp.com/..." {...register("whatsappUrl")} />
        </FormField>

        <fieldset className="rounded-lg border border-ink-200 p-4">
          <legend className="px-1 text-sm font-medium text-ink-700">Social Links</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Facebook" htmlFor="facebook">
              <Input id="facebook" placeholder="https://facebook.com/..." {...register("socialLinks.facebook")} />
            </FormField>
            <FormField label="Instagram" htmlFor="instagram">
              <Input id="instagram" placeholder="https://instagram.com/..." {...register("socialLinks.instagram")} />
            </FormField>
            <FormField label="LinkedIn" htmlFor="linkedin">
              <Input id="linkedin" placeholder="https://linkedin.com/..." {...register("socialLinks.linkedin")} />
            </FormField>
            <FormField label="Twitter / X" htmlFor="twitter">
              <Input id="twitter" placeholder="https://x.com/..." {...register("socialLinks.twitter")} />
            </FormField>
            <FormField label="YouTube" htmlFor="youtube">
              <Input id="youtube" placeholder="https://youtube.com/..." {...register("socialLinks.youtube")} />
            </FormField>
          </div>
        </fieldset>

        <FormField label="Footer Text" htmlFor="footerText">
          <Input id="footerText" {...register("footerText")} />
        </FormField>
        <FormField label="Privacy Policy" htmlFor="privacyPolicy">
          <Textarea id="privacyPolicy" rows={6} {...register("privacyPolicy")} />
        </FormField>
        <FormField label="Terms &amp; Conditions" htmlFor="terms">
          <Textarea id="terms" rows={6} {...register("terms")} />
        </FormField>

        <Button type="submit" loading={isSubmitting}>
          Save Settings
        </Button>
      </form>
    </div>
  );
}

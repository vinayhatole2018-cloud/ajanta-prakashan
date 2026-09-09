"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Pencil, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/common/Button";
import { Checkbox, FormField, Input, Select } from "@/components/common/FormControls";
import { Skeleton } from "@/components/common/LoadingSpinner";
import { friendlyFirebaseError } from "@/components/common/ErrorState";
import { DESIGNATION_OPTIONS, registrationSchema, type RegistrationFormValues } from "@/schemas/registration";
import { registerUser } from "@/services/userService";
import { usePublicAuth } from "@/contexts/PublicAuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { loading: authLoading, profile, refreshProfile } = usePublicAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormValues>({ resolver: zodResolver(registrationSchema) });

  useEffect(() => {
    if (!authLoading && !profile) router.replace("/register?next=/profile");
  }, [authLoading, profile, router]);

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName,
        mobile: profile.mobile,
        email: profile.email || "",
        city: profile.city,
        designation: profile.designation as RegistrationFormValues["designation"],
        institution: profile.institution,
        state: profile.state || "",
        notificationEnabled: profile.notificationEnabled,
      });
    }
  }, [profile, reset]);

  async function onSubmit(values: RegistrationFormValues) {
    setSaving(true);
    setServerError(null);
    try {
      await registerUser({
        fullName: values.fullName,
        mobile: values.mobile,
        email: values.email || null,
        city: values.city,
        designation: values.designation,
        institution: values.institution,
        state: values.state || null,
        notificationEnabled: values.notificationEnabled,
      });
      await refreshProfile();
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setServerError(friendlyFirebaseError(err));
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !profile) {
    return (
      <div className="container-page py-12">
        <Skeleton className="h-96 w-full max-w-2xl rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container-page max-w-2xl py-12">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <UserRound className="h-7 w-7" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink-900">My Profile</h1>
          <p className="text-sm text-ink-500">Your registration details for Ajanta Prakashan conferences.</p>
        </div>
      </div>

      {saved && (
        <p className="mt-6 flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> Profile updated successfully.
        </p>
      )}

      {!editing ? (
        <div className="mt-6 rounded-xl border border-ink-200 bg-white p-6">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Field label="Full Name" value={profile.fullName} />
            <Field label="Mobile Number" value={profile.mobile} />
            <Field label="Email" value={profile.email || "—"} />
            <Field label="City" value={profile.city} />
            <Field label="State" value={profile.state || "—"} />
            <Field label="Designation" value={profile.designation} />
            <Field label="Institution" value={profile.institution} />
            <Field label="Notifications" value={profile.notificationEnabled ? "Enabled" : "Disabled"} />
          </dl>
          <Button className="mt-6" variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" /> Edit Profile
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5 rounded-xl border border-ink-200 bg-white p-6">
          {serverError && <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{serverError}</p>}

          <FormField label="Full Name" htmlFor="fullName" required error={errors.fullName?.message}>
            <Input id="fullName" invalid={!!errors.fullName} {...register("fullName")} />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Mobile Number" htmlFor="mobile" required error={errors.mobile?.message}>
              <Input id="mobile" inputMode="numeric" maxLength={10} invalid={!!errors.mobile} {...register("mobile")} />
            </FormField>
            <FormField label="Email (optional)" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" invalid={!!errors.email} {...register("email")} />
            </FormField>
          </div>

          <FormField label="City" htmlFor="city" required error={errors.city?.message}>
            <Input id="city" invalid={!!errors.city} {...register("city")} />
          </FormField>

          <FormField label="State (optional)" htmlFor="state" error={errors.state?.message}>
            <Input id="state" invalid={!!errors.state} {...register("state")} />
          </FormField>

          <FormField label="Designation" htmlFor="designation" required error={errors.designation?.message}>
            <Select id="designation" invalid={!!errors.designation} {...register("designation")}>
              {DESIGNATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="School / College / Institution" htmlFor="institution" required error={errors.institution?.message}>
            <Input id="institution" invalid={!!errors.institution} {...register("institution")} />
          </FormField>

          <Checkbox label="Notify me about upcoming conferences and events" {...register("notificationEnabled")} />

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink-900">{value}</dd>
    </div>
  );
}

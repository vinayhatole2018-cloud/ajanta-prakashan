"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/common/Button";
import { Checkbox, FormField, Input, Select } from "@/components/common/FormControls";
import { Skeleton } from "@/components/common/LoadingSpinner";
import { DESIGNATION_OPTIONS, registrationSchema, type RegistrationFormValues } from "@/schemas/registration";
import { registerUser } from "@/services/userService";
import { getConferenceById } from "@/services/conferenceService";
import { friendlyFirebaseError } from "@/components/common/ErrorState";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { buildWhatsAppLink, registrationWhatsAppMessage } from "@/utils/whatsapp";

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conferenceId = searchParams.get("conferenceId");
  const next = searchParams.get("next");

  const { loading: authLoading, profile, refreshProfile } = usePublicAuth();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [whatsAppHref, setWhatsAppHref] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { notificationEnabled: true },
  });

  // Already registered on this device — nothing to do here, send them onward.
  useEffect(() => {
    if (!authLoading && profile && !submitted) {
      router.replace(next || (conferenceId ? `/conferences/${conferenceId}` : "/profile"));
    }
  }, [authLoading, profile, submitted, next, conferenceId, router]);

  async function onSubmit(values: RegistrationFormValues) {
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

      if (conferenceId) {
        const conference = await getConferenceById(conferenceId).catch(() => null);
        if (conference?.whatsappNumber) {
          setWhatsAppHref(buildWhatsAppLink(conference.whatsappNumber, registrationWhatsAppMessage(conference.title, values.fullName)));
        }
      }
      setSubmitted(true);
    } catch (err) {
      setServerError(friendlyFirebaseError(err));
    }
  }

  if (authLoading || (profile && !submitted)) {
    return (
      <div className="container-page py-12">
        <Skeleton className="h-96 w-full max-w-2xl rounded-xl" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
        <div className="max-w-md rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h1 className="mt-4 font-serif text-xl font-semibold text-emerald-900">Registration successful!</h1>
          <p className="mt-2 text-sm text-emerald-800">You will receive updates about upcoming conferences and events.</p>
          <div className="mt-6 flex flex-col gap-3">
            {whatsAppHref && (
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
              >
                <MessageCircle className="h-4 w-4" /> Message us on WhatsApp
              </a>
            )}
            <Link
              href={next || (conferenceId ? `/conferences/${conferenceId}` : "/conferences")}
              className="inline-flex items-center justify-center rounded-lg border border-emerald-300 bg-white px-5 py-2.5 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
            >
              {conferenceId ? "View Conference" : "Browse Conferences"}
            </Link>
            <Link href="/profile" className="text-sm text-emerald-700 underline hover:text-emerald-900">
              View my profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page max-w-2xl py-12">
      <h1 className="font-serif text-3xl font-bold text-ink-900">Register</h1>
      <p className="mt-2 text-ink-500">
        Register your details to view conferences and receive updates about upcoming events. No OTP verification required.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5 rounded-xl border border-ink-200 bg-white p-6">
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
          <Select id="designation" invalid={!!errors.designation} defaultValue="" {...register("designation")}>
            <option value="" disabled>
              Select designation
            </option>
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

        <Checkbox label="Notify me about upcoming conferences and events" {...register("notificationEnabled")} defaultChecked />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Register
        </Button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container-page py-12"><Skeleton className="h-96 w-full max-w-2xl rounded-xl" /></div>}>
      <RegisterPageInner />
    </Suspense>
  );
}

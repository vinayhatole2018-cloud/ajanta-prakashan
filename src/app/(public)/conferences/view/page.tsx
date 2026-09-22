"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, Clock, IndianRupee, Mail, MapPin, Phone, Radio } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/LoadingSpinner";
import { Badge } from "@/components/common/Badge";
import { CTAButtons } from "@/components/public/CTAButtons";
import { FeeTable } from "@/components/public/FeeCard";
import { TracksList, SubThemesList } from "@/components/public/TrackCard";
import { CommitteeSection } from "@/components/public/CommitteeSection";
import { RequireRegistration } from "@/components/public/RequireRegistration";
import { getConferenceById } from "@/services/conferenceService";
import { getCommitteesByConference } from "@/services/committeeService";
import type { CommitteeMember, Conference } from "@/types";
import { formatDate } from "@/utils/date";

export default function ConferenceDetailPage() {
  return (
    <Suspense fallback={<div className="container-page py-12"><Skeleton className="h-64 w-full rounded-xl" /></div>}>
      <RequireRegistration>
        <ConferenceDetailInner />
      </RequireRegistration>
    </Suspense>
  );
}

function ConferenceDetailInner() {
  const id = useSearchParams().get("id") || "";
  const [conference, setConference] = useState<Conference | null | undefined>(undefined);
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);

  useEffect(() => {
    if (!id) {
      setConference(null);
      return;
    }
    getConferenceById(id).then((c) => {
      setConference(c);
      if (c) document.title = `${c.title} | Ajanta Prakashan`;
    });
    getCommitteesByConference(id).then(setCommittee).catch(() => setCommittee([]));
  }, [id]);

  if (conference === undefined) {
    return (
      <div className="container-page py-12">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="mt-6 h-8 w-2/3 rounded-md" />
        <Skeleton className="mt-3 h-4 w-1/3 rounded-md" />
      </div>
    );
  }

  if (conference === null || conference.status === "archived") {
    return (
      <div className="container-page py-16">
        <EmptyState title="Conference not found" description="This conference may have been removed or is no longer available." />
      </div>
    );
  }

  return (
    <div>
      <div className="relative bg-ink-900">
        <div className="container-page relative py-14 sm:py-20">
          <Badge tone="brand">{conference.mode.toUpperCase()}</Badge>
          <h1 className="mt-4 max-w-3xl font-serif text-3xl font-bold text-white sm:text-4xl">{conference.title}</h1>
          {conference.theme && <p className="mt-1 max-w-2xl text-ink-400">Theme: {conference.theme}</p>}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-200">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-400" /> {formatDate(conference.date)}
            </span>
            {conference.startTime && (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-400" /> {conference.startTime}
                {conference.endTime ? ` – ${conference.endTime}` : ""}
              </span>
            )}
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-400" /> {conference.venue}
            </span>
          </div>
          <div className="mt-7">
            <CTAButtons conference={conference} />
          </div>
        </div>
      </div>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-12">
          {conference.description && (
            <SectionBlock title="About the Conference">
              <p className="prose-content whitespace-pre-line">{conference.description}</p>
            </SectionBlock>
          )}

          {conference.objectives?.length > 0 && (
            <SectionBlock title="Objectives">
              <ol className="list-decimal space-y-3 pl-5 text-ink-700">
                {conference.objectives.map((obj, i) => (
                  <li key={i} className="leading-relaxed">
                    {obj}
                  </li>
                ))}
              </ol>
            </SectionBlock>
          )}

          {conference.tracks?.length > 0 && (
            <SectionBlock title="Conference Tracks">
              <TracksList tracks={conference.tracks} />
            </SectionBlock>
          )}

          {conference.subThemes?.length > 0 && (
            <SectionBlock title="Suggested Sub-Themes" subtitle="This list is suggestive — papers on any conference-related theme are welcome.">
              <SubThemesList groups={conference.subThemes} />
            </SectionBlock>
          )}

          {conference.paperGuidelines && (
            <SectionBlock title="Call for Papers &amp; Guidelines">
              <ul className="grid gap-2 text-sm text-ink-700 sm:grid-cols-2">
                <li>Font: {conference.paperGuidelines.font}, {conference.paperGuidelines.fontSize}</li>
                <li>Line spacing: {conference.paperGuidelines.lineSpacing}</li>
                <li>File format: {conference.paperGuidelines.fileFormat}</li>
                <li>Margins: {conference.paperGuidelines.marginLeft} left / {conference.paperGuidelines.marginRight} right</li>
                <li>Word limit: {conference.paperGuidelines.maxWords}</li>
                <li>References: {conference.paperGuidelines.referenceStyle} style</li>
                <li>Plagiarism limit: {conference.paperGuidelines.plagiarismLimit}</li>
                {conference.paperGuidelines.journalName && (
                  <li>
                    Journal: {conference.paperGuidelines.journalName}
                    {conference.paperGuidelines.journalIssn ? ` (ISSN ${conference.paperGuidelines.journalIssn})` : ""}
                  </li>
                )}
              </ul>
              {conference.paperGuidelines.requiredFields?.length > 0 && (
                <p className="mt-3 text-sm text-ink-600">
                  Required in the manuscript: {conference.paperGuidelines.requiredFields.join(", ")}.
                </p>
              )}
              {conference.paperGuidelines.submissionNote && (
                <p className="mt-3 text-sm text-ink-600">{conference.paperGuidelines.submissionNote}</p>
              )}
              {conference.paperGuidelines.awards && (
                <p className="mt-3 text-sm font-medium text-brand-700">{conference.paperGuidelines.awards}</p>
              )}
            </SectionBlock>
          )}

          {committee.length > 0 && (
            <SectionBlock title="Organizing Committee">
              <CommitteeSection members={committee} />
            </SectionBlock>
          )}

          {conference.paymentInformation && (
            <SectionBlock title="Payment Information">
              <div className="rounded-xl border border-ink-200 bg-white p-5">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <Field label="Account Name" value={conference.paymentInformation.accountName} />
                  <Field label="Account Number" value={conference.paymentInformation.accountNumber} />
                  <Field label="Bank" value={conference.paymentInformation.bank} />
                  <Field label="Branch" value={conference.paymentInformation.branch} />
                  <Field label="IFSC Code" value={conference.paymentInformation.ifsc} />
                  {conference.paymentInformation.upiMobile && (
                    <Field label="GPay / PhonePe" value={conference.paymentInformation.upiMobile} />
                  )}
                </dl>
                {conference.paymentInformation.paymentQrUrl && (
                  <div className="mt-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={conference.paymentInformation.paymentQrUrl} alt="Payment QR code" className="h-48 w-48 rounded-lg border border-ink-200 object-contain" />
                  </div>
                )}
                {conference.paymentInformation.notes && <p className="mt-3 text-sm text-ink-500">{conference.paymentInformation.notes}</p>}
              </div>
            </SectionBlock>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {conference.registrationFees?.length > 0 && (
            <SidebarCard title="Registration Fees" icon={IndianRupee}>
              <FeeTable fees={conference.registrationFees} />
            </SidebarCard>
          )}

          {conference.importantDates?.length > 0 && (
            <SidebarCard title="Important Dates" icon={Calendar}>
              <ul className="space-y-2.5 text-sm">
                {conference.importantDates.map((d, i) => (
                  <li key={i} className="flex items-center justify-between gap-3">
                    <span className="text-ink-600">{d.label}</span>
                    <span className="font-medium text-ink-900">{formatDate(d.date)}</span>
                  </li>
                ))}
              </ul>
            </SidebarCard>
          )}

          <SidebarCard title="Venue" icon={MapPin}>
            <p className="text-sm text-ink-700">{conference.venue}</p>
            {conference.address && <p className="mt-1 text-sm text-ink-500">{conference.address}</p>}
            <p className="mt-1 text-sm text-ink-500">
              {conference.city}
              {conference.city && conference.state ? ", " : ""}
              {conference.state}
            </p>
          </SidebarCard>

          {(conference.organizer || conference.coOrganizer) && (
            <SidebarCard title="Organized By" icon={Radio}>
              <p className="text-sm text-ink-700">{conference.organizer}</p>
              {conference.coOrganizer && <p className="mt-1 text-sm text-ink-500">In collaboration with {conference.coOrganizer}</p>}
            </SidebarCard>
          )}

          {(conference.contactEmail || conference.contactPhone) && (
            <SidebarCard title="Contact" icon={Mail}>
              {conference.contactEmail && (
                <a href={`mailto:${conference.contactEmail}`} className="flex items-center gap-2 text-sm text-brand-600 hover:underline">
                  <Mail className="h-3.5 w-3.5" /> {conference.contactEmail}
                </a>
              )}
              {conference.contactPhone && (
                <a href={`tel:${conference.contactPhone}`} className="mt-2 flex items-center gap-2 text-sm text-brand-600 hover:underline">
                  <Phone className="h-3.5 w-3.5" /> {conference.contactPhone}
                </a>
              )}
            </SidebarCard>
          )}

          <Link href="/conferences" className="block text-center text-sm text-ink-500 hover:text-ink-700">
            ← Back to all conferences
          </Link>
        </aside>
      </div>
    </div>
  );
}

function SectionBlock({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-xl font-semibold text-ink-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SidebarCard({ title, icon: Icon, children }: { title: string; icon: typeof Calendar; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
        <Icon className="h-4 w-4 text-brand-500" /> {title}
      </h3>
      {children}
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

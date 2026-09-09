"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/common/Button";
import { Checkbox, FormField, Input, Select, Textarea } from "@/components/common/FormControls";
import type { Conference, ConferenceInput, ConferenceMode, ContentStatus } from "@/types";
import { newId } from "@/utils/id";

interface TrackFormValue {
  id: string;
  title: string;
  disciplines: string; // comma-separated in the form, array in storage
}
interface SubThemeFormValue {
  id: string;
  category: string;
  items: string; // one per line in the form, array in storage
}

export interface ConferenceFormValues {
  title: string;
  theme: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  mode: ConferenceMode;
  organizer: string;
  coOrganizer: string;
  brochureUrl: string;
  registrationUrl: string;
  paperSubmissionUrl: string;
  whatsappUrl: string;
  whatsappNumber: string;
  websiteUrl: string;
  contactEmail: string;
  contactPhone: string;
  objectivesText: string; // one per line
  tracks: TrackFormValue[];
  subThemes: SubThemeFormValue[];
  registrationFees: { category: string; amount: number; currency: string; notes: string }[];
  importantDates: { label: string; date: string }[];
  paperGuidelines: {
    font: string;
    fontSize: string;
    lineSpacing: string;
    fileFormat: string;
    marginLeft: string;
    marginRight: string;
    maxWords: string;
    requiredFieldsText: string;
    referenceStyle: string;
    plagiarismLimit: string;
    submissionNote: string;
    awards: string;
    journalName: string;
    journalIssn: string;
    journalImpactFactor: string;
  };
  hasPayment: boolean;
  paymentInformation: {
    accountName: string;
    accountNumber: string;
    bank: string;
    branch: string;
    ifsc: string;
    paymentQrUrl: string;
    upiId: string;
    upiMobile: string;
    notes: string;
  };
  status: ContentStatus;
}

export function conferenceToFormValues(c: Conference | null): ConferenceFormValues {
  return {
    title: c?.title || "",
    theme: c?.theme || "",
    description: c?.description || "",
    date: c?.date || "",
    startTime: c?.startTime || "",
    endTime: c?.endTime || "",
    venue: c?.venue || "",
    address: c?.address || "",
    city: c?.city || "",
    state: c?.state || "",
    mode: c?.mode || "offline",
    organizer: c?.organizer || "",
    coOrganizer: c?.coOrganizer || "",
    brochureUrl: c?.brochureUrl || "",
    registrationUrl: c?.registrationUrl || "",
    paperSubmissionUrl: c?.paperSubmissionUrl || "",
    whatsappUrl: c?.whatsappUrl || "",
    whatsappNumber: c?.whatsappNumber || "",
    websiteUrl: c?.websiteUrl || "",
    contactEmail: c?.contactEmail || "",
    contactPhone: c?.contactPhone || "",
    objectivesText: (c?.objectives || []).join("\n"),
    tracks: (c?.tracks || []).map((t) => ({ id: t.id, title: t.title, disciplines: t.disciplines.join(", ") })),
    subThemes: (c?.subThemes || []).map((s) => ({ id: s.id, category: s.category, items: s.items.join("\n") })),
    registrationFees: (c?.registrationFees || []).map((f) => ({ ...f, notes: f.notes || "" })),
    importantDates: c?.importantDates || [],
    paperGuidelines: {
      font: c?.paperGuidelines?.font || "Times New Roman",
      fontSize: c?.paperGuidelines?.fontSize || "12pt",
      lineSpacing: c?.paperGuidelines?.lineSpacing || "1.5",
      fileFormat: c?.paperGuidelines?.fileFormat || "MS Word (.doc/.docx)",
      marginLeft: c?.paperGuidelines?.marginLeft || "1.5 inch",
      marginRight: c?.paperGuidelines?.marginRight || "1 inch",
      maxWords: c?.paperGuidelines?.maxWords || "2000",
      requiredFieldsText: (c?.paperGuidelines?.requiredFields || []).join(", "),
      referenceStyle: c?.paperGuidelines?.referenceStyle || "APA",
      plagiarismLimit: c?.paperGuidelines?.plagiarismLimit || "Below 10%",
      submissionNote: c?.paperGuidelines?.submissionNote || "",
      awards: c?.paperGuidelines?.awards || "",
      journalName: c?.paperGuidelines?.journalName || "",
      journalIssn: c?.paperGuidelines?.journalIssn || "",
      journalImpactFactor: c?.paperGuidelines?.journalImpactFactor || "",
    },
    hasPayment: !!c?.paymentInformation,
    paymentInformation: {
      accountName: c?.paymentInformation?.accountName || "",
      accountNumber: c?.paymentInformation?.accountNumber || "",
      bank: c?.paymentInformation?.bank || "",
      branch: c?.paymentInformation?.branch || "",
      ifsc: c?.paymentInformation?.ifsc || "",
      paymentQrUrl: c?.paymentInformation?.paymentQrUrl || "",
      upiId: c?.paymentInformation?.upiId || "",
      upiMobile: c?.paymentInformation?.upiMobile || "",
      notes: c?.paymentInformation?.notes || "",
    },
    status: c?.status || "draft",
  };
}

export function formValuesToConferenceInput(v: ConferenceFormValues): ConferenceInput {
  return {
    title: v.title.trim(),
    theme: v.theme.trim(),
    description: v.description.trim(),
    date: v.date,
    startTime: v.startTime,
    endTime: v.endTime,
    venue: v.venue.trim(),
    address: v.address.trim(),
    city: v.city.trim(),
    state: v.state.trim(),
    mode: v.mode,
    organizer: v.organizer.trim(),
    coOrganizer: v.coOrganizer.trim(),
    brochureUrl: v.brochureUrl.trim() || null,
    registrationUrl: v.registrationUrl.trim() || null,
    paperSubmissionUrl: v.paperSubmissionUrl.trim() || null,
    whatsappUrl: v.whatsappUrl.trim() || null,
    whatsappNumber: v.whatsappNumber.trim().replace(/\D/g, "") || null,
    websiteUrl: v.websiteUrl.trim() || null,
    contactEmail: v.contactEmail.trim() || null,
    contactPhone: v.contactPhone.trim() || null,
    objectives: v.objectivesText.split("\n").map((s) => s.trim()).filter(Boolean),
    tracks: v.tracks.map((t) => ({ id: t.id, title: t.title.trim(), disciplines: t.disciplines.split(",").map((d) => d.trim()).filter(Boolean) })),
    subThemes: v.subThemes.map((s) => ({ id: s.id, category: s.category.trim(), items: s.items.split("\n").map((i) => i.trim()).filter(Boolean) })),
    registrationFees: v.registrationFees.map((f) => ({ ...f, amount: Number(f.amount) || 0 })),
    importantDates: v.importantDates.filter((d) => d.label && d.date),
    paperGuidelines: {
      font: v.paperGuidelines.font,
      fontSize: v.paperGuidelines.fontSize,
      lineSpacing: v.paperGuidelines.lineSpacing,
      fileFormat: v.paperGuidelines.fileFormat,
      marginLeft: v.paperGuidelines.marginLeft,
      marginRight: v.paperGuidelines.marginRight,
      maxWords: v.paperGuidelines.maxWords,
      requiredFields: v.paperGuidelines.requiredFieldsText.split(",").map((s) => s.trim()).filter(Boolean),
      referenceStyle: v.paperGuidelines.referenceStyle,
      plagiarismLimit: v.paperGuidelines.plagiarismLimit,
      submissionNote: v.paperGuidelines.submissionNote,
      awards: v.paperGuidelines.awards,
      journalName: v.paperGuidelines.journalName || null,
      journalIssn: v.paperGuidelines.journalIssn || null,
      journalImpactFactor: v.paperGuidelines.journalImpactFactor || null,
    },
    paymentInformation: v.hasPayment
      ? {
          accountName: v.paymentInformation.accountName.trim(),
          accountNumber: v.paymentInformation.accountNumber.trim(),
          bank: v.paymentInformation.bank.trim(),
          branch: v.paymentInformation.branch.trim(),
          ifsc: v.paymentInformation.ifsc.trim(),
          paymentQrUrl: v.paymentInformation.paymentQrUrl.trim() || null,
          upiId: v.paymentInformation.upiId.trim() || null,
          upiMobile: v.paymentInformation.upiMobile.trim() || null,
          notes: v.paymentInformation.notes.trim() || null,
        }
      : null,
    status: v.status,
  };
}

export function ConferenceForm({
  defaultValues,
  onSubmit,
  onCancel,
  onSaveAsDraft,
  submitting,
}: {
  defaultValues: ConferenceFormValues;
  onSubmit: (values: ConferenceFormValues) => void;
  onCancel: () => void;
  onSaveAsDraft: (values: ConferenceFormValues) => void;
  submitting?: boolean;
}) {
  const { register, handleSubmit, control, watch } = useForm<ConferenceFormValues>({ defaultValues });
  const tracksArray = useFieldArray({ control, name: "tracks" });
  const subThemesArray = useFieldArray({ control, name: "subThemes" });
  const feesArray = useFieldArray({ control, name: "registrationFees" });
  const datesArray = useFieldArray({ control, name: "importantDates" });
  const hasPayment = watch("hasPayment");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <FormSection title="Basic Information">
        <FormField label="Title" htmlFor="title" required>
          <Input id="title" {...register("title", { required: true })} />
        </FormField>
        <FormField label="Theme" htmlFor="theme">
          <Input id="theme" {...register("theme")} />
        </FormField>
        <FormField label="Description" htmlFor="description">
          <Textarea id="description" rows={4} {...register("description")} />
        </FormField>
      </FormSection>

      <FormSection title="Date &amp; Venue">
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField label="Date" htmlFor="date" required>
            <Input id="date" type="date" {...register("date", { required: true })} />
          </FormField>
          <FormField label="Start Time" htmlFor="startTime">
            <Input id="startTime" placeholder="10:00 AM" {...register("startTime")} />
          </FormField>
          <FormField label="End Time" htmlFor="endTime">
            <Input id="endTime" placeholder="5:00 PM" {...register("endTime")} />
          </FormField>
        </div>
        <FormField label="Mode" htmlFor="mode">
          <Select id="mode" {...register("mode")}>
            <option value="offline">Offline</option>
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
          </Select>
        </FormField>
        <FormField label="Venue" htmlFor="venue" required>
          <Input id="venue" {...register("venue", { required: true })} />
        </FormField>
        <FormField label="Address" htmlFor="address">
          <Textarea id="address" rows={2} {...register("address")} />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="City" htmlFor="city">
            <Input id="city" {...register("city")} />
          </FormField>
          <FormField label="State" htmlFor="state">
            <Input id="state" {...register("state")} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Organizer">
        <FormField label="Organizer" htmlFor="organizer" required>
          <Input id="organizer" {...register("organizer", { required: true })} />
        </FormField>
        <FormField label="Co-Organizer" htmlFor="coOrganizer">
          <Input id="coOrganizer" {...register("coOrganizer")} />
        </FormField>
      </FormSection>

      <FormSection title="Brochure" hint="Only https:// URLs are accepted.">
        <FormField label="Brochure URL" htmlFor="brochureUrl">
          <Input id="brochureUrl" placeholder="https://..." {...register("brochureUrl")} />
        </FormField>
      </FormSection>

      <FormSection title="Links">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Registration URL" htmlFor="registrationUrl">
            <Input id="registrationUrl" placeholder="https://..." {...register("registrationUrl")} />
          </FormField>
          <FormField label="Paper Submission URL" htmlFor="paperSubmissionUrl">
            <Input id="paperSubmissionUrl" placeholder="https://..." {...register("paperSubmissionUrl")} />
          </FormField>
          <FormField label="WhatsApp Group URL" htmlFor="whatsappUrl" hint="Invite link, for the 'Join WhatsApp Group' button">
            <Input id="whatsappUrl" placeholder="https://chat.whatsapp.com/..." {...register("whatsappUrl")} />
          </FormField>
          <FormField
            label="WhatsApp Number"
            htmlFor="whatsappNumber"
            hint="Country code + number, digits only. After someone registers for this conference, they're shown a button that opens a chat to this number with a pre-written message."
          >
            <Input id="whatsappNumber" placeholder="919579260877" {...register("whatsappNumber")} />
          </FormField>
          <FormField label="Website URL" htmlFor="websiteUrl">
            <Input id="websiteUrl" placeholder="https://..." {...register("websiteUrl")} />
          </FormField>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Contact Email" htmlFor="contactEmail">
            <Input id="contactEmail" type="email" {...register("contactEmail")} />
          </FormField>
          <FormField label="Contact Phone" htmlFor="contactPhone">
            <Input id="contactPhone" {...register("contactPhone")} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Objectives" hint="One objective per line.">
        <Textarea rows={4} {...register("objectivesText")} />
      </FormSection>

      <FormSection title="Conference Tracks">
        <div className="space-y-4">
          {tracksArray.fields.map((field, i) => (
            <div key={field.id} className="grid gap-3 rounded-lg border border-ink-200 p-4 sm:grid-cols-[1fr_1fr_auto]">
              <FormField label={`Track ${i + 1} Title`}>
                <Input {...register(`tracks.${i}.title` as const)} />
              </FormField>
              <FormField label="Disciplines" hint="Comma-separated">
                <Input {...register(`tracks.${i}.disciplines` as const)} />
              </FormField>
              <div className="flex items-end">
                <Button type="button" variant="ghost" onClick={() => tracksArray.remove(i)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => tracksArray.append({ id: newId(), title: "", disciplines: "" })}>
            <Plus className="h-4 w-4" /> Add Track
          </Button>
        </div>
      </FormSection>

      <FormSection title="Sub-Themes">
        <div className="space-y-4">
          {subThemesArray.fields.map((field, i) => (
            <div key={field.id} className="rounded-lg border border-ink-200 p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <FormField label="Category">
                  <Input {...register(`subThemes.${i}.category` as const)} />
                </FormField>
                <div className="flex items-end">
                  <Button type="button" variant="ghost" onClick={() => subThemesArray.remove(i)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <FormField label="Items" hint="One per line" htmlFor={`subtheme-items-${i}`}>
                <Textarea id={`subtheme-items-${i}`} rows={3} {...register(`subThemes.${i}.items` as const)} />
              </FormField>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => subThemesArray.append({ id: newId(), category: "", items: "" })}
          >
            <Plus className="h-4 w-4" /> Add Sub-Theme Category
          </Button>
        </div>
      </FormSection>

      <FormSection title="Registration Fees">
        <div className="space-y-3">
          {feesArray.fields.map((field, i) => (
            <div key={field.id} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
              <FormField label="Category">
                <Input {...register(`registrationFees.${i}.category` as const)} />
              </FormField>
              <FormField label="Amount (₹)">
                <Input type="number" step="1" {...register(`registrationFees.${i}.amount` as const, { valueAsNumber: true })} />
              </FormField>
              <FormField label="Notes">
                <Input {...register(`registrationFees.${i}.notes` as const)} />
              </FormField>
              <Button type="button" variant="ghost" onClick={() => feesArray.remove(i)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => feesArray.append({ category: "", amount: 0, currency: "INR", notes: "" })}
          >
            <Plus className="h-4 w-4" /> Add Fee Category
          </Button>
        </div>
      </FormSection>

      <FormSection title="Important Dates">
        <div className="space-y-3">
          {datesArray.fields.map((field, i) => (
            <div key={field.id} className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
              <FormField label="Label">
                <Input placeholder="Last date for submission" {...register(`importantDates.${i}.label` as const)} />
              </FormField>
              <FormField label="Date">
                <Input type="date" {...register(`importantDates.${i}.date` as const)} />
              </FormField>
              <Button type="button" variant="ghost" onClick={() => datesArray.remove(i)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => datesArray.append({ label: "", date: "" })}>
            <Plus className="h-4 w-4" /> Add Date
          </Button>
        </div>
      </FormSection>

      <FormSection title="Paper Guidelines">
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField label="Font">
            <Input {...register("paperGuidelines.font")} />
          </FormField>
          <FormField label="Font Size">
            <Input {...register("paperGuidelines.fontSize")} />
          </FormField>
          <FormField label="Line Spacing">
            <Input {...register("paperGuidelines.lineSpacing")} />
          </FormField>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField label="File Format">
            <Input {...register("paperGuidelines.fileFormat")} />
          </FormField>
          <FormField label="Left Margin">
            <Input {...register("paperGuidelines.marginLeft")} />
          </FormField>
          <FormField label="Right Margin">
            <Input {...register("paperGuidelines.marginRight")} />
          </FormField>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField label="Max Words">
            <Input {...register("paperGuidelines.maxWords")} />
          </FormField>
          <FormField label="Reference Style">
            <Input {...register("paperGuidelines.referenceStyle")} />
          </FormField>
          <FormField label="Plagiarism Limit">
            <Input {...register("paperGuidelines.plagiarismLimit")} />
          </FormField>
        </div>
        <FormField label="Required Fields in Manuscript" hint="Comma-separated">
          <Input {...register("paperGuidelines.requiredFieldsText")} />
        </FormField>
        <FormField label="Submission Note">
          <Textarea rows={2} {...register("paperGuidelines.submissionNote")} />
        </FormField>
        <FormField label="Awards">
          <Input {...register("paperGuidelines.awards")} />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField label="Journal Name">
            <Input {...register("paperGuidelines.journalName")} />
          </FormField>
          <FormField label="Journal ISSN">
            <Input {...register("paperGuidelines.journalIssn")} />
          </FormField>
          <FormField label="Impact Factor">
            <Input {...register("paperGuidelines.journalImpactFactor")} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Payment Information">
        <Checkbox label="This conference collects registration payment" {...register("hasPayment")} />
        {hasPayment && (
          <div className="mt-4 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Account Name">
                <Input {...register("paymentInformation.accountName")} />
              </FormField>
              <FormField label="Account Number">
                <Input {...register("paymentInformation.accountNumber")} />
              </FormField>
              <FormField label="Bank">
                <Input {...register("paymentInformation.bank")} />
              </FormField>
              <FormField label="Branch">
                <Input {...register("paymentInformation.branch")} />
              </FormField>
              <FormField label="IFSC Code">
                <Input {...register("paymentInformation.ifsc")} />
              </FormField>
              <FormField label="Payment QR URL">
                <Input placeholder="https://..." {...register("paymentInformation.paymentQrUrl")} />
              </FormField>
              <FormField label="UPI ID (optional)">
                <Input {...register("paymentInformation.upiId")} />
              </FormField>
              <FormField label="GPay/PhonePe Mobile (optional)">
                <Input {...register("paymentInformation.upiMobile")} />
              </FormField>
            </div>
            <FormField label="Notes">
              <Textarea rows={2} {...register("paymentInformation.notes")} />
            </FormField>
          </div>
        )}
      </FormSection>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap justify-end gap-3 border-t border-ink-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="button" variant="secondary" onClick={handleSubmit(onSaveAsDraft)} loading={submitting}>
          Save Draft
        </Button>
        <Button type="submit" loading={submitting}>
          Publish
        </Button>
      </div>
    </form>
  );
}

function FormSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="border-b border-ink-200 pb-2 text-base font-semibold text-ink-900">{title}</h3>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

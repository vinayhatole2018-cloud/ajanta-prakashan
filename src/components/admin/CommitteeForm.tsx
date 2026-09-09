"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/common/Button";
import { FormField, Input, Select } from "@/components/common/FormControls";
import { committeeMemberSchema, type CommitteeMemberFormValues } from "@/schemas/committee";
import { COMMITTEE_CATEGORIES, type CommitteeMember } from "@/types";

export function CommitteeForm({
  conferenceId,
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}: {
  conferenceId: string;
  defaultValues: CommitteeMember | null;
  onSubmit: (values: CommitteeMemberFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CommitteeMemberFormValues>({
    resolver: zodResolver(committeeMemberSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      designation: defaultValues?.designation || "",
      institution: defaultValues?.institution || "",
      category: defaultValues?.category || "Organising Committee",
      displayOrder: defaultValues?.displayOrder ?? 0,
      conferenceId,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5">
      <FormField label="Name" htmlFor="name" required error={errors.name?.message}>
        <Input id="name" invalid={!!errors.name} {...register("name")} />
      </FormField>
      <FormField label="Designation" htmlFor="designation">
        <Input id="designation" {...register("designation")} />
      </FormField>
      <FormField label="Institution" htmlFor="institution">
        <Input id="institution" {...register("institution")} />
      </FormField>
      <FormField label="Category" htmlFor="category">
        <Select id="category" {...register("category")}>
          {COMMITTEE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Display Order" htmlFor="displayOrder">
        <Input id="displayOrder" type="number" {...register("displayOrder", { valueAsNumber: true })} />
      </FormField>
      <div className="flex justify-end gap-3 border-t border-ink-200 pt-5">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save
        </Button>
      </div>
    </form>
  );
}

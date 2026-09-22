"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/common/Button";
import { Checkbox, FormField, Input } from "@/components/common/FormControls";
import { landingImageSchema, type LandingImageFormValues } from "@/schemas/landingImage";
import { isCloudinaryConfigured, uploadImageToCloudinary } from "@/utils/cloudinary";
import type { LandingImage } from "@/types";

export function LandingImageForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}: {
  defaultValues: LandingImage | null;
  onSubmit: (values: LandingImageFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LandingImageFormValues>({
    resolver: zodResolver(landingImageSchema),
    defaultValues: {
      imageUrl: defaultValues?.imageUrl || "",
      caption: defaultValues?.caption || "",
      linkUrl: defaultValues?.linkUrl || "",
      displayOrder: defaultValues?.displayOrder ?? 0,
      active: defaultValues?.active ?? true,
      showAsPopup: defaultValues?.showAsPopup ?? false,
    },
  });

  const imageUrl = watch("imageUrl");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadEnabled = isCloudinaryConfigured();

  async function handleFileChosen(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setValue("imageUrl", url, { shouldValidate: true, shouldDirty: true });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5">
      <FormField label="Image" htmlFor="imageUrl" required error={errors.imageUrl?.message || uploadError || undefined}>
        {uploadEnabled && (
          <div className="mb-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChosen(e.target.files?.[0])}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading…" : "Upload from device"}
            </Button>
            <span className="ml-2 text-xs text-ink-400">or paste a URL below</span>
          </div>
        )}
        <Input
          id="imageUrl"
          placeholder="https://..."
          invalid={!!errors.imageUrl}
          {...register("imageUrl")}
        />
        {!uploadEnabled && <p className="mt-1 text-xs text-ink-400">Only https:// URLs are accepted.</p>}
      </FormField>

      {imageUrl && !errors.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-32 w-full rounded-lg border border-ink-200 object-cover" />
      )}

      <FormField label="Caption (optional)" htmlFor="caption">
        <Input id="caption" {...register("caption")} />
      </FormField>

      <FormField
        label="Link URL (optional)"
        htmlFor="linkUrl"
        error={errors.linkUrl?.message}
        hint="Where clicking the image should go — e.g. a conference page. Leave blank for a non-clickable image."
      >
        <Input id="linkUrl" placeholder="https://..." {...register("linkUrl")} />
      </FormField>

      <FormField label="Display Order" htmlFor="displayOrder" hint="Lower numbers show first.">
        <Input id="displayOrder" type="number" {...register("displayOrder", { valueAsNumber: true })} />
      </FormField>

      <Checkbox label="Active (visible on the public home page)" {...register("active")} />
      <div>
        <Checkbox label="Also show as a popup banner on page load" {...register("showAsPopup")} />
        <p className="mt-1 pl-6 text-xs text-ink-400">
          Appears once per visitor session, on any public page, until dismissed. Only the first active popup image (by display order) is shown at a time.
        </p>
      </div>

      <div className="flex justify-end gap-3 border-t border-ink-200 pt-5">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} disabled={uploading}>
          Save
        </Button>
      </div>
    </form>
  );
}

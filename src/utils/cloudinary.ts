/**
 * Direct browser upload to Cloudinary via an UNSIGNED upload preset — the
 * only file upload path in this app. Everything else stores admin-entered
 * URLs only (Firebase Storage is intentionally never used — see README).
 *
 * Deliberately NOT using signed uploads: this app is a static export (no
 * server — see next.config.ts), and a signed upload needs the API Secret to
 * generate a signature, which must never be exposed client-side. An unsigned
 * upload preset (configured in the Cloudinary dashboard to only allow image
 * uploads into a specific folder) avoids needing the secret entirely while
 * staying safe to call straight from the browser.
 */

function cloudName(): string | undefined {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
}

function uploadPreset(): string | undefined {
  return process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudName() && uploadPreset());
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloud = cloudName();
  const preset = uploadPreset();
  if (!cloud || !preset) {
    throw new Error("Image upload is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET, or paste an image URL instead.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > 32 * 1024 * 1024) {
    throw new Error("Image must be under 32 MB.");
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", preset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, {
    method: "POST",
    body,
  });
  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.secure_url) {
    throw new Error(json?.error?.message || "Image upload failed. Please try again or paste a URL instead.");
  }

  return json.secure_url as string;
}

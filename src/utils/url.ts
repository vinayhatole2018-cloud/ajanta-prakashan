/** Only https:// URLs are ever allowed for admin-entered media/links — rejects javascript:, data:, file:, http:// etc. */
export function isSafeHttpsUrl(value: string): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Same as isSafeHttpsUrl but also accepts a same-origin absolute path like "/documents/x.pdf". */
export function isSafeHttpsUrlOrLocalPath(value: string): boolean {
  if (!value) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  return isSafeHttpsUrl(value);
}

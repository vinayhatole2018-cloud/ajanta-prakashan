/** Builds a WhatsApp click-to-chat link with a pre-filled message. `number` must be digits only, with country code (e.g. "919579260877"). */
export function buildWhatsAppLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Normalizes a stored contact number (which may or may not include the country code) into wa.me's digits-only, country-code-prefixed shape. Assumes India (+91) for a bare 10-digit number, since that's this app's audience. */
export function normalizeToWaNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function registrationWhatsAppMessage(conferenceTitle: string, fullName: string): string {
  return `Hi, I'm ${fullName}. I've just registered for "${conferenceTitle}" on Ajanta Prakashan. Please share further updates.`;
}

/** For the "Register Now" CTA itself — a visitor expressing interest, not yet confirmed. */
export function interestWhatsAppMessage(title: string, date: string, fullName?: string | null): string {
  const who = fullName ? `Hi, I'm ${fullName}.` : "Hi,";
  return `${who} I'm interested in registering for "${title}"${date ? ` (${date})` : ""}. Please share the registration details.`;
}

import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/firebase/firestore";
import type { SiteSettings } from "@/types";

const DOC_PATH = ["settings", "site"] as const;

export const DEFAULT_SETTINGS: SiteSettings = {
  websiteName: "Ajanta Prakashan",
  description:
    "Ajanta Prakashan organizes and publishes peer-reviewed national and international academic conferences across disciplines.",
  logoUrl: null,
  contactEmail: "",
  contactPhone: "",
  address: "",
  whatsappUrl: null,
  socialLinks: {},
  footerText: "",
  privacyPolicy: "",
  terms: "",
  updatedAt: null,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const snap = await getDoc(doc(getFirebaseDb(), ...DOC_PATH));
  if (!snap.exists()) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(snap.data() as SiteSettings) };
}

export function watchSiteSettings(callback: (settings: SiteSettings) => void) {
  return onSnapshot(doc(getFirebaseDb(), ...DOC_PATH), (snap) => {
    callback(snap.exists() ? { ...DEFAULT_SETTINGS, ...(snap.data() as SiteSettings) } : DEFAULT_SETTINGS);
  });
}

export async function updateSiteSettings(input: Partial<Omit<SiteSettings, "updatedAt">>): Promise<void> {
  await setDoc(doc(getFirebaseDb(), ...DOC_PATH), { ...input, updatedAt: serverTimestamp() }, { merge: true });
}

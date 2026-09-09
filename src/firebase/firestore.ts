import { type Timestamp, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "./config";

export { getFirebaseDb };
export const nowTimestamp = () => serverTimestamp();

/** Converts a Firestore Timestamp (or Date/undefined) to a JS Date safely. */
export function toDate(value: Timestamp | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as Timestamp).toDate === "function") return (value as Timestamp).toDate();
  return null;
}

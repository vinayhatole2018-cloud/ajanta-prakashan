import {
  type User,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirebaseAuth } from "./config";

export function signInAdmin(email: string, password: string) {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export function signOutAdmin() {
  return signOut(getFirebaseAuth());
}

export function resetAdminPassword(email: string) {
  return sendPasswordResetEmail(getFirebaseAuth(), email);
}

export function watchAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

/**
 * Silent, credential-free identity for public visitors — NOT a login. There is
 * no email/password, no OTP, and no user-visible sign-in UI; this only gives
 * each browser a stable Firebase UID so Firestore security rules can tell
 * "this device completed registration" apart from "this device did not"
 * without ever storing an open collection read/query publicly.
 */
export function ensureAnonymousSignIn() {
  return signInAnonymously(getFirebaseAuth());
}

export type { User };

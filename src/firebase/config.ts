import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Auth, connectAuthEmulator, getAuth } from "firebase/auth";
import { type Firestore, connectFirestoreEmulator, initializeFirestore } from "firebase/firestore";

// IMPORTANT: Firebase Storage is intentionally never imported or configured
// anywhere in this app. All media (banners, posters, brochures, logos,
// payment QR codes) is referenced by external URL only. See README.md.

const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (useEmulator ? "demo-api-key" : undefined),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (useEmulator ? "demo-ajanta-prakashan" : undefined),
  // storageBucket is intentionally NOT read here — this app does not use Firebase Storage.
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (useEmulator ? "demo-app-id" : undefined),
};

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let authEmulatorConnected = false;
let dbEmulatorConnected = false;

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Copy .env.example to .env.local and fill in your Firebase project credentials."
    );
  }
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp());
  if (useEmulator && !authEmulatorConnected) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    authEmulatorConnected = true;
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  // ignoreUndefinedProperties: a form field left blank often ends up as JS
  // `undefined` a few transforms later (e.g. `value || undefined`). Firestore
  // throws a hard "Unsupported field value: undefined" on that by default;
  // this makes such stray fields simply get omitted instead of failing the
  // whole write, permanently closing off this entire class of bug.
  if (!db) db = initializeFirestore(getFirebaseApp(), { ignoreUndefinedProperties: true });
  if (useEmulator && !dbEmulatorConnected) {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    dbEmulatorConnected = true;
  }
  return db;
}

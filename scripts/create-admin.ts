/**
 * Authorizes a Firebase Authentication user as an admin by writing their UID
 * into the `admins` collection. If no user exists yet for the given email,
 * creates one with a generated password (printed once — save it).
 *
 * Usage:
 *   npx tsx scripts/create-admin.ts admin@example.com
 *   npx tsx scripts/create-admin.ts admin@example.com "MyChosenPassword123!"
 */
import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const email = process.argv[2];
const providedPassword = process.argv[3];
if (!email) {
  console.error("Usage: npx tsx scripts/create-admin.ts <admin-email> [password]");
  process.exit(1);
}

const serviceAccountPath = resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json");
if (!existsSync(serviceAccountPath)) {
  console.error(`Service account key not found at ${serviceAccountPath}.`);
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < 16; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function main() {
  let uid: string;
  let generatedPassword: string | null = null;

  try {
    const existing = await getAuth().getUserByEmail(email!);
    uid = existing.uid;
    if (providedPassword) {
      await getAuth().updateUser(uid, { password: providedPassword });
    }
    console.log(`Found existing Authentication user for ${email}.`);
  } catch {
    generatedPassword = providedPassword || generatePassword();
    const created = await getAuth().createUser({ email: email!, password: generatedPassword, emailVerified: true });
    uid = created.uid;
    console.log(`Created new Authentication user for ${email}.`);
  }

  await getFirestore()
    .collection("admins")
    .doc(uid)
    .set({
      uid,
      email,
      role: "admin",
      active: true,
      createdAt: FieldValue.serverTimestamp(),
    });

  console.log(`\n✓ ${email} is now an authorized admin. Log in at /admin.`);
  if (generatedPassword) {
    console.log(`\nGenerated password (save this now — it will not be shown again):\n  ${generatedPassword}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

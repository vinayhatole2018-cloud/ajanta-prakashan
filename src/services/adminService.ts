import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getFirebaseDb } from "@/firebase/firestore";
import type { AdminAccount, AdminLog, AdminLogAction } from "@/types";

const ADMINS_COLLECTION = "admins";
const LOGS_COLLECTION = "adminLogs";

/**
 * Authoritative admin check on the client mirrors the Firestore Security Rules'
 * isAdmin() function (see firestore.rules): the UID must exist in `admins`,
 * be active, and have role "admin". This client-side check only gates UI —
 * every actual read/write is still enforced server-side by the rules.
 */
export async function getAdminAccount(uid: string): Promise<AdminAccount | null> {
  const snap = await getDoc(doc(getFirebaseDb(), ADMINS_COLLECTION, uid));
  if (!snap.exists()) return null;
  const data = snap.data() as AdminAccount;
  if (!data.active || data.role !== "admin") return null;
  return data;
}

export async function logAdminAction(entry: {
  adminUid: string;
  adminEmail: string;
  action: AdminLogAction;
  resource: string;
  resourceId: string;
}): Promise<void> {
  await addDoc(collection(getFirebaseDb(), LOGS_COLLECTION), {
    ...entry,
    timestamp: serverTimestamp(),
  });
}

export interface AdminLogListPage {
  items: AdminLog[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export async function listAdminLogs(opts: {
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
}): Promise<AdminLogListPage> {
  const pageSize = opts.pageSize ?? 50;
  const db = getFirebaseDb();
  let q = query(collection(db, LOGS_COLLECTION), orderBy("timestamp", "desc"), limit(pageSize + 1));
  if (opts.cursor) q = query(collection(db, LOGS_COLLECTION), orderBy("timestamp", "desc"), startAfter(opts.cursor), limit(pageSize + 1));
  const snap = await getDocs(q);
  const docs = snap.docs.slice(0, pageSize);
  return {
    items: docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdminLog, "id">) })),
    lastDoc: docs.length ? docs[docs.length - 1] : null,
    hasMore: snap.docs.length > pageSize,
  };
}

export async function countAdminLogs(): Promise<number> {
  const snap = await getCountFromServer(query(collection(getFirebaseDb(), LOGS_COLLECTION)));
  return snap.data().count;
}

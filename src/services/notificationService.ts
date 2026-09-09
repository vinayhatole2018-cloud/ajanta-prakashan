import {
  type DocumentData,
  type QueryDocumentSnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/firebase/firestore";
import type { NotificationInput, NotificationItem } from "@/types";

const COLLECTION = "notifications";

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): NotificationItem {
  return { id: snap.id, ...(snap.data() as Omit<NotificationItem, "id">) };
}

export async function getNotificationById(id: string): Promise<NotificationItem | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<NotificationItem, "id">) };
}

export async function createNotification(input: NotificationInput): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateNotification(id: string, input: Partial<NotificationInput>): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), { ...input, updatedAt: serverTimestamp() });
}

export async function deleteNotification(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), COLLECTION, id));
}

export interface NotificationListPage {
  items: NotificationItem[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export async function listNotificationsAdmin(opts: {
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
}): Promise<NotificationListPage> {
  const pageSize = opts.pageSize ?? 25;
  const db = getFirebaseDb();
  let q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"), limit(pageSize + 1));
  if (opts.cursor) q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"), startAfter(opts.cursor), limit(pageSize + 1));
  const snap = await getDocs(q);
  const docs = snap.docs.slice(0, pageSize);
  return { items: docs.map(fromDoc), lastDoc: docs.length ? docs[docs.length - 1] : null, hasMore: snap.docs.length > pageSize };
}

/** Public: published notifications, most recent first, cursor-paginated (never loads the whole collection). */
export async function getPublishedNotifications(opts: {
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
}): Promise<NotificationListPage> {
  const pageSize = opts.pageSize ?? 15;
  const db = getFirebaseDb();
  let q = query(collection(db, COLLECTION), where("isPublished", "==", true), orderBy("createdAt", "desc"), limit(pageSize + 1));
  if (opts.cursor) {
    q = query(collection(db, COLLECTION), where("isPublished", "==", true), orderBy("createdAt", "desc"), startAfter(opts.cursor), limit(pageSize + 1));
  }
  const snap = await getDocs(q);
  const docs = snap.docs.slice(0, pageSize);
  return { items: docs.map(fromDoc), lastDoc: docs.length ? docs[docs.length - 1] : null, hasMore: snap.docs.length > pageSize };
}

export async function countNotifications(): Promise<{ total: number; published: number }> {
  const db = getFirebaseDb();
  const [all, published] = await Promise.all([
    getCountFromServer(query(collection(db, COLLECTION))),
    getCountFromServer(query(collection(db, COLLECTION), where("isPublished", "==", true))),
  ]);
  return { total: all.data().count, published: published.data().count };
}

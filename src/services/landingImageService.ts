import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { getFirebaseDb } from "@/firebase/firestore";
import type { LandingImage, LandingImageInput } from "@/types";

const COLLECTION = "landingImages";

function fromDoc(d: { id: string; data: () => unknown }): LandingImage {
  return { id: d.id, ...(d.data() as Omit<LandingImage, "id">) };
}

/** Public: only active images, in display order. Used on the home page. */
export async function getActiveLandingImages(): Promise<LandingImage[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(query(collection(db, COLLECTION), where("active", "==", true), orderBy("displayOrder", "asc")));
  return snap.docs.map(fromDoc);
}

/** Admin: every image (active or not), in display order. */
export async function listLandingImagesAdmin(): Promise<LandingImage[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy("displayOrder", "asc")));
  return snap.docs.map(fromDoc);
}

export async function createLandingImage(input: LandingImageInput): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateLandingImage(id: string, input: Partial<LandingImageInput>): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), { ...input, updatedAt: serverTimestamp() });
}

export async function deleteLandingImage(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), COLLECTION, id));
}

export async function reorderLandingImage(id: string, displayOrder: number): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), { displayOrder, updatedAt: serverTimestamp() });
}

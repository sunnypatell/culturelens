// Server-side Firebase utilities for API routes
// These functions can be used in Next.js API routes (server-side)
// IMPORTANT: Uses Firebase Admin SDK which bypasses all security rules

import { getAdminDb, getAdminStorage } from "./firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

// Firestore utility functions for server-side use with Admin SDK
export const createDocument = async (
  collectionName: string,
  data: Record<string, unknown>
) => {
  const docRef = await getAdminDb()
    .collection(collectionName)
    .add({
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  return docRef.id;
};

export const createDocumentWithId = async (
  collectionName: string,
  docId: string,
  data: Record<string, unknown>
) => {
  await getAdminDb()
    .collection(collectionName)
    .doc(docId)
    .set({
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  return docId;
};

export const updateDocument = async (
  collectionName: string,
  docId: string,
  data: Record<string, unknown>
) => {
  await getAdminDb()
    .collection(collectionName)
    .doc(docId)
    .update({
      ...data,
      updatedAt: Timestamp.now(),
    });
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  await getAdminDb().collection(collectionName).doc(docId).delete();
};

export const getDocument = async (collectionName: string, docId: string) => {
  const docSnap = await getAdminDb()
    .collection(collectionName)
    .doc(docId)
    .get();
  return docSnap.exists ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getDocuments = async (
  collectionName: string,
  constraints: Array<Record<string, unknown>> = []
) => {
  let query: FirebaseFirestore.Query = getAdminDb().collection(collectionName);

  // apply constraints
  for (const constraint of constraints) {
    if (constraint.type === "where") {
      query = query.where(
        constraint.field as string,
        constraint.op as FirebaseFirestore.WhereFilterOp,
        constraint.value
      );
    } else if (constraint.type === "orderBy") {
      query = query.orderBy(
        constraint.field as string,
        constraint.direction as FirebaseFirestore.OrderByDirection
      );
    } else if (constraint.type === "limit") {
      query = query.limit(constraint.count as number);
    }
  }

  const querySnapshot = await query.get();
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Common query constraints for Admin SDK
export const whereEqual = (field: string, value: unknown) => ({
  type: "where",
  field,
  op: "==",
  value,
});

export const whereIn = (field: string, values: unknown[]) => ({
  type: "where",
  field,
  op: "in",
  value: values,
});

export const orderByField = (
  field: string,
  direction: "asc" | "desc" = "asc"
) => ({
  type: "orderBy",
  field,
  direction,
});

export const limitResults = (count: number) => ({
  type: "limit",
  count,
});

// Firebase Storage operations using Admin SDK
export const uploadFile = async (
  file: File,
  path: string
): Promise<{ downloadURL: string; path: string }> => {
  const bucket = getAdminStorage().bucket();
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const fileRef = bucket.file(path);
  await fileRef.save(fileBuffer, {
    metadata: {
      contentType: file.type,
    },
  });

  // make file publicly accessible
  await fileRef.makePublic();

  const downloadURL = `https://storage.googleapis.com/${bucket.name}/${path}`;

  return { downloadURL, path };
};

export const deleteFile = async (path: string): Promise<void> => {
  const bucket = getAdminStorage().bucket();
  await bucket.file(path).delete();
};

export const getFileURL = async (path: string): Promise<string> => {
  const bucket = getAdminStorage().bucket();
  const [url] = await bucket.file(path).getSignedUrl({
    action: "read",
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  });
  return url;
};

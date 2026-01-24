// Server-side Firebase utilities for API routes
// These functions can be used in Next.js API routes (server-side)

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from './firebase';

// Firestore utility functions for server-side use
export const createDocument = async (collectionName: string, data: any) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  await deleteDoc(doc(db, collectionName, docId));
};

export const getDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getDocuments = async (collectionName: string, constraints: any[] = []) => {
  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Storage utility functions for server-side use
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return { downloadURL, path: snapshot.ref.fullPath };
};

export const deleteFile = async (path: string) => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

export const getFileURL = async (path: string) => {
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
};

// Common queries
export const whereEqual = (field: string, value: any) => where(field, '==', value);
export const whereIn = (field: string, values: any[]) => where(field, 'in', values);
export const orderByField = (field: string, direction: 'asc' | 'desc' = 'asc') => orderBy(field, direction);
export const limitResults = (count: number) => limit(count);
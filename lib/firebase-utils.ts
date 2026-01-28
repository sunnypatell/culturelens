// Firebase utility functions and hooks
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  doc,
  query,
  onSnapshot,
  QueryConstraint,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { auth, db } from "./firebase";

// Re-export server-side utilities from firebase-server-utils
// This avoids code duplication while maintaining a clean API
export {
  createDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  getDocuments,
  uploadFile,
  deleteFile,
  getFileURL,
  whereEqual,
  whereIn,
  orderByField,
  limitResults,
} from "./firebase-server-utils";

// Authentication hooks and functions
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};

export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (
  email: string,
  password: string,
  displayName: string
) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  return result;
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

export const logout = async () => {
  return await signOut(auth);
};

// Real-time listeners
export const useCollection = (
  collectionName: string,
  constraints: QueryConstraint[] = []
) => {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, collectionName), ...constraints);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(documents);
      setLoading(false);
    });

    return unsubscribe;
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading };
};

export const useDocument = (collectionName: string, docId: string) => {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId) return;

    const docRef = doc(db, collectionName, docId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      setData(doc.exists() ? { id: doc.id, ...doc.data() } : null);
      setLoading(false);
    });

    return unsubscribe;
  }, [collectionName, docId]);

  return { data, loading };
};

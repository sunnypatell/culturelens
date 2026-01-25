/**
 * firebase admin SDK initialization (server-side only)
 * provides admin access to firebase services with elevated privileges
 */

import {
  initializeApp,
  getApps,
  cert,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// global singleton to survive hot-reload in development
const globalForFirebase = globalThis as unknown as {
  firestoreInstance: ReturnType<typeof getFirestore> | undefined;
  firestoreSettingsApplied: boolean | undefined;
};

// initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  // check if already initialized
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // initialize with service account credentials
  const serviceAccount: ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail:
      process.env.FIREBASE_CLIENT_EMAIL ||
      "firebase-adminsdk-fbsvc@culturelens-2dd38.iam.gserviceaccount.com",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

// initialize Firestore with settings (using globalThis to survive hot-reload)
function getFirestoreWithSettings() {
  if (!globalForFirebase.firestoreInstance) {
    globalForFirebase.firestoreInstance = getFirestore(adminApp);
  }

  // only apply settings once ever (tracked separately to handle edge cases)
  if (!globalForFirebase.firestoreSettingsApplied) {
    try {
      globalForFirebase.firestoreInstance.settings({
        ignoreUndefinedProperties: true,
      });
      globalForFirebase.firestoreSettingsApplied = true;
    } catch {
      // settings already applied, ignore error
      globalForFirebase.firestoreSettingsApplied = true;
    }
  }

  return globalForFirebase.firestoreInstance;
}

export const adminApp = initializeFirebaseAdmin();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestoreWithSettings();
export const adminStorage = getStorage(adminApp);

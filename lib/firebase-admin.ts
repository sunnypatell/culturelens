/**
 * firebase admin SDK initialization (server-side only)
 * provides admin access to firebase services with elevated privileges
 *
 * uses lazy initialization so the build succeeds without credentials
 * (CI environments run typecheck/lint/test without firebase secrets).
 * the SDK only initializes on the first actual API request.
 */

import {
  initializeApp,
  getApps,
  cert,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// global singleton to survive hot-reload in development
const g = globalThis as unknown as {
  _firebaseAdmin?: App;
  _firestoreSettingsApplied?: boolean;
};

function ensureApp(): App {
  if (g._firebaseAdmin) return g._firebaseAdmin;

  if (getApps().length > 0) {
    g._firebaseAdmin = getApps()[0];
    return g._firebaseAdmin;
  }

  const serviceAccount: ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail:
      process.env.FIREBASE_CLIENT_EMAIL ||
      "firebase-adminsdk-fbsvc@culturelens-2dd38.iam.gserviceaccount.com",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  g._firebaseAdmin = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return g._firebaseAdmin;
}

function ensureFirestore() {
  const db = getFirestore(ensureApp());

  if (!g._firestoreSettingsApplied) {
    try {
      db.settings({ ignoreUndefinedProperties: true });
      g._firestoreSettingsApplied = true;
    } catch {
      g._firestoreSettingsApplied = true;
    }
  }

  return db;
}

/** lazy — only initializes Firebase on first call */
export function getAdminApp() {
  return ensureApp();
}

/** lazy — only initializes Firebase on first call */
export function getAdminAuth() {
  return getAuth(ensureApp());
}

/** lazy — only initializes Firebase on first call */
export function getAdminDb() {
  return ensureFirestore();
}

/** lazy — only initializes Firebase on first call */
export function getAdminStorage() {
  return getStorage(ensureApp());
}

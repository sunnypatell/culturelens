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
  });
}

export const adminApp = initializeFirebaseAdmin();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

// account linking utilities for managing multiple auth providers per user

import {
  User,
  linkWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  PhoneAuthProvider,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "./firebase";
import {
  getDocument,
  createDocumentWithId,
  updateDocument,
} from "./firebase-server-utils";
import {
  COLLECTIONS,
  generateUserIdFromUid,
  FIELDS,
  AUTH_PROVIDERS,
} from "./firestore-constants";

export interface UserProfile {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  linkedProviders: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * creates or updates user profile in Firestore when user signs in
 * @param user - Firebase Auth user object
 */
export async function createOrUpdateUserProfile(
  user: User
): Promise<UserProfile> {
  console.log(`[ACCOUNT_LINKING] Creating or updating user profile:`, {
    uid: user.uid,
    email: user.email,
    providers: user.providerData.map((p) => p.providerId),
  });

  const userId = generateUserIdFromUid(user.uid);

  // extract linked providers from providerData
  const linkedProviders = user.providerData.map((p) => p.providerId);

  const profile: UserProfile = {
    id: userId,
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    phoneNumber: user.phoneNumber,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    linkedProviders,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    // check if profile already exists
    const existingProfile = await getDocument(COLLECTIONS.USERS, userId);

    if (existingProfile) {
      console.log(
        `[ACCOUNT_LINKING] User profile exists, updating...`,
        userId
      );

      // update existing profile with latest data
      await updateDocument(COLLECTIONS.USERS, userId, {
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        linkedProviders,
        updatedAt: new Date().toISOString(),
      });

      console.log(`[ACCOUNT_LINKING] User profile updated successfully`);
    } else {
      console.log(
        `[ACCOUNT_LINKING] User profile does not exist, creating...`,
        userId
      );

      // create new profile
      await createDocumentWithId(COLLECTIONS.USERS, userId, profile);

      console.log(`[ACCOUNT_LINKING] User profile created successfully`);
    }

    return profile;
  } catch (error) {
    console.error(
      `[ACCOUNT_LINKING] Failed to create/update user profile:`,
      error
    );
    throw error;
  }
}

/**
 * checks if an email is already registered with any auth provider
 * @param email - email address to check
 * @returns array of provider IDs (e.g., ['password', 'google.com'])
 */
export async function checkExistingProviders(
  email: string
): Promise<string[]> {
  console.log(
    `[ACCOUNT_LINKING] Checking existing providers for email:`,
    email
  );

  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);

    console.log(`[ACCOUNT_LINKING] Found existing providers:`, methods);

    return methods;
  } catch (error) {
    console.error(
      `[ACCOUNT_LINKING] Failed to check existing providers:`,
      error
    );
    return [];
  }
}

/**
 * links a phone number to an existing user account
 * @param user - current Firebase Auth user
 * @param phoneCredential - PhoneAuthProvider credential
 */
export async function linkPhoneToAccount(
  user: User,
  phoneCredential: any
): Promise<void> {
  console.log(`[ACCOUNT_LINKING] Linking phone to account:`, {
    uid: user.uid,
    email: user.email,
  });

  try {
    await linkWithCredential(user, phoneCredential);

    console.log(`[ACCOUNT_LINKING] Phone linked successfully`);

    // update user profile in Firestore
    await createOrUpdateUserProfile(user);
  } catch (error: any) {
    console.error(`[ACCOUNT_LINKING] Failed to link phone:`, error);

    // handle account-exists-with-different-credential error
    if (error.code === "auth/credential-already-in-use") {
      console.warn(
        `[ACCOUNT_LINKING] Phone number already in use by another account`
      );
      throw new Error(
        "This phone number is already associated with another account"
      );
    }

    throw error;
  }
}

/**
 * links Google account to an existing user account
 * @param user - current Firebase Auth user
 * @param googleCredential - GoogleAuthProvider credential
 */
export async function linkGoogleToAccount(
  user: User,
  googleCredential: any
): Promise<void> {
  console.log(`[ACCOUNT_LINKING] Linking Google to account:`, {
    uid: user.uid,
    email: user.email,
  });

  try {
    await linkWithCredential(user, googleCredential);

    console.log(`[ACCOUNT_LINKING] Google linked successfully`);

    // update user profile in Firestore
    await createOrUpdateUserProfile(user);
  } catch (error: any) {
    console.error(`[ACCOUNT_LINKING] Failed to link Google:`, error);

    if (error.code === "auth/credential-already-in-use") {
      console.warn(
        `[ACCOUNT_LINKING] Google account already in use by another account`
      );
      throw new Error(
        "This Google account is already associated with another account"
      );
    }

    throw error;
  }
}

/**
 * handles account linking when user signs in with a provider
 * that has the same email as an existing account
 * @param email - user's email address
 * @param currentProviderId - the provider being used to sign in
 */
export async function handleAccountLinking(
  email: string,
  currentProviderId: string
): Promise<{
  shouldLink: boolean;
  existingProviders: string[];
  message?: string;
}> {
  console.log(`[ACCOUNT_LINKING] Checking if account linking needed:`, {
    email,
    currentProviderId,
  });

  const existingProviders = await checkExistingProviders(email);

  if (existingProviders.length === 0) {
    console.log(
      `[ACCOUNT_LINKING] No existing providers, creating new account`
    );
    return {
      shouldLink: false,
      existingProviders: [],
    };
  }

  if (existingProviders.includes(currentProviderId)) {
    console.log(
      `[ACCOUNT_LINKING] Provider already linked, proceeding with sign-in`
    );
    return {
      shouldLink: false,
      existingProviders,
    };
  }

  console.log(`[ACCOUNT_LINKING] Account linking recommended:`, {
    email,
    existingProviders,
    newProvider: currentProviderId,
  });

  return {
    shouldLink: true,
    existingProviders,
    message: `This email is already registered with ${existingProviders.join(", ")}. Your accounts will be linked automatically.`,
  };
}

/**
 * gets user profile from Firestore by UID
 * @param uid - Firebase Auth UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  console.log(`[ACCOUNT_LINKING] Fetching user profile for UID:`, uid);

  const userId = generateUserIdFromUid(uid);

  try {
    const profile = await getDocument(COLLECTIONS.USERS, userId);

    if (!profile) {
      console.warn(`[ACCOUNT_LINKING] User profile not found for UID:`, uid);
      return null;
    }

    console.log(`[ACCOUNT_LINKING] User profile retrieved successfully`);

    return profile as UserProfile;
  } catch (error) {
    console.error(`[ACCOUNT_LINKING] Failed to get user profile:`, error);
    return null;
  }
}

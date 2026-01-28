// account linking utilities for managing multiple auth providers per user

import {
  User,
  AuthCredential,
  linkWithCredential,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "./firebase";
import { logger } from "@/lib/logger";

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
  logger.info(
    {
      uid: user.uid,
      email: user.email,
      providers: user.providerData.map((p) => p.providerId),
    },
    `[ACCOUNT_LINKING] Creating or updating user profile:`
  );

  // extract linked providers from providerData
  const linkedProviders = user.providerData.map((p) => p.providerId);

  try {
    // sync profile via API endpoint
    const token = await user.getIdToken();

    const response = await fetch("/api/user/sync-profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        linkedProviders,
      }),
    });

    // get response text first to handle both JSON and HTML responses
    const responseText = await response.text();

    if (!response.ok) {
      let errorData: Record<string, unknown> = {};
      try {
        errorData = JSON.parse(responseText);
      } catch {
        logger.error(
          {
            status: response.status,
            responsePreview: responseText.substring(0, 200),
          },
          `[ACCOUNT_LINKING] Received HTML instead of JSON:`
        );
      }
      throw new Error(
        (errorData as { error?: { message?: string } })?.error?.message ||
          "failed to sync user profile"
      );
    }

    // parse successful JSON response
    let result: { data: UserProfile };
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      logger.error(
        {
          parseError,
          responsePreview: responseText.substring(0, 200),
        },
        `[ACCOUNT_LINKING] Failed to parse response:`
      );
      throw new Error("invalid response format from server");
    }

    logger.info(`[ACCOUNT_LINKING] User profile synced successfully`);

    return result.data;
  } catch (error) {
    logger.error(
      { data: error },
      `[ACCOUNT_LINKING] Failed to create/update user profile:`
    );
    throw error;
  }
}

/**
 * checks if an email is already registered with any auth provider
 * @param email - email address to check
 * @returns array of provider IDs (e.g., ['password', 'google.com'])
 */
export async function checkExistingProviders(email: string): Promise<string[]> {
  logger.info(
    { data: email },
    `[ACCOUNT_LINKING] Checking existing providers for email:`
  );

  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);

    logger.info(
      { data: methods },
      `[ACCOUNT_LINKING] Found existing providers:`
    );

    return methods;
  } catch (error) {
    logger.error(
      { data: error },
      `[ACCOUNT_LINKING] Failed to check existing providers:`
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
  phoneCredential: AuthCredential
): Promise<void> {
  logger.info(
    {
      uid: user.uid,
      email: user.email,
    },
    `[ACCOUNT_LINKING] Linking phone to account:`
  );

  try {
    await linkWithCredential(user, phoneCredential);

    logger.info(`[ACCOUNT_LINKING] Phone linked successfully`);

    // update user profile in Firestore
    await createOrUpdateUserProfile(user);
  } catch (error: unknown) {
    logger.error({ data: error }, `[ACCOUNT_LINKING] Failed to link phone:`);

    // handle account-exists-with-different-credential error
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "auth/credential-already-in-use"
    ) {
      logger.warn(
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
  googleCredential: AuthCredential
): Promise<void> {
  logger.info(
    {
      uid: user.uid,
      email: user.email,
    },
    `[ACCOUNT_LINKING] Linking Google to account:`
  );

  try {
    await linkWithCredential(user, googleCredential);

    logger.info(`[ACCOUNT_LINKING] Google linked successfully`);

    // update user profile in Firestore
    await createOrUpdateUserProfile(user);
  } catch (error: unknown) {
    logger.error({ data: error }, `[ACCOUNT_LINKING] Failed to link Google:`);

    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "auth/credential-already-in-use"
    ) {
      logger.warn(
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
  logger.info(
    {
      email,
      currentProviderId,
    },
    `[ACCOUNT_LINKING] Checking if account linking needed:`
  );

  const existingProviders = await checkExistingProviders(email);

  if (existingProviders.length === 0) {
    logger.info(
      `[ACCOUNT_LINKING] No existing providers, creating new account`
    );
    return {
      shouldLink: false,
      existingProviders: [],
    };
  }

  if (existingProviders.includes(currentProviderId)) {
    logger.info(
      `[ACCOUNT_LINKING] Provider already linked, proceeding with sign-in`
    );
    return {
      shouldLink: false,
      existingProviders,
    };
  }

  logger.info(
    {
      email,
      existingProviders,
      newProvider: currentProviderId,
    },
    `[ACCOUNT_LINKING] Account linking recommended:`
  );

  return {
    shouldLink: true,
    existingProviders,
    message: `This email is already registered with ${existingProviders.join(", ")}. Your accounts will be linked automatically.`,
  };
}

/**
 * gets user profile from Firestore by UID
 * @param uid - Firebase Auth UID
 * @param token - Firebase Auth token
 */
export async function getUserProfile(
  uid: string,
  token: string
): Promise<UserProfile | null> {
  logger.info(
    { data: uid },
    `[ACCOUNT_LINKING] Fetching user profile for UID:`
  );

  try {
    const response = await fetch("/api/user/sync-profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      logger.warn(
        { data: uid },
        `[ACCOUNT_LINKING] User profile not found for UID:`
      );
      return null;
    }

    // get response text first to handle both JSON and HTML responses
    const responseText = await response.text();

    let result: { data?: UserProfile };
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      logger.error(
        {
          parseError,
          responsePreview: responseText.substring(0, 200),
        },
        `[ACCOUNT_LINKING] Failed to parse GET response:`
      );
      return null;
    }

    if (!result.data) {
      logger.warn(
        { data: uid },
        `[ACCOUNT_LINKING] User profile not found for UID:`
      );
      return null;
    }

    logger.info(`[ACCOUNT_LINKING] User profile retrieved successfully`);

    return result.data ?? null;
  } catch (error) {
    logger.error(
      { data: error },
      `[ACCOUNT_LINKING] Failed to get user profile:`
    );
    return null;
  }
}

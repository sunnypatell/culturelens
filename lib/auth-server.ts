/**
 * server-side firebase authentication utilities
 * uses admin SDK for user management and token verification
 */

import { getAdminAuth } from "./firebase-admin";

function auth() {
  return getAdminAuth();
}

export interface CreateUserData {
  email: string;
  password: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
}

export interface UserClaims {
  role?: "admin" | "user" | "moderator";
  plan?: "free" | "pro" | "enterprise";
  emailVerified?: boolean;
  [key: string]: unknown;
}

/**
 * creates a new user with email/password
 */
export async function createUser(data: CreateUserData) {
  try {
    const userRecord = await auth().createUser({
      email: data.email,
      password: data.password,
      displayName: data.displayName,
      phoneNumber: data.phoneNumber,
      photoURL: data.photoURL,
      emailVerified: false,
    });

    // set default role as 'user'
    await setUserClaims(userRecord.uid, { role: "user", plan: "free" });

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to create user: ${error.message}`);
    }
    throw new Error("failed to create user: unknown error");
  }
}

/**
 * verifies a firebase ID token and returns decoded token
 */
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`invalid token: ${error.message}`);
    }
    throw new Error("invalid token: unknown error");
  }
}

/**
 * gets user by UID
 */
export async function getUserByUid(uid: string) {
  try {
    const userRecord = await auth().getUser(uid);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      emailVerified: userRecord.emailVerified,
      phoneNumber: userRecord.phoneNumber,
      customClaims: userRecord.customClaims as UserClaims,
      createdAt: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`user not found: ${error.message}`);
    }
    throw new Error("user not found: unknown error");
  }
}

/**
 * gets user by email
 */
export async function getUserByEmail(email: string) {
  try {
    const userRecord = await auth().getUserByEmail(email);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      emailVerified: userRecord.emailVerified,
      phoneNumber: userRecord.phoneNumber,
      customClaims: userRecord.customClaims as UserClaims,
      createdAt: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`user not found: ${error.message}`);
    }
    throw new Error("user not found: unknown error");
  }
}

/**
 * gets user by phone number
 */
export async function getUserByPhone(phoneNumber: string) {
  try {
    const userRecord = await auth().getUserByPhoneNumber(phoneNumber);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      emailVerified: userRecord.emailVerified,
      phoneNumber: userRecord.phoneNumber,
      customClaims: userRecord.customClaims as UserClaims,
      createdAt: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`user not found: ${error.message}`);
    }
    throw new Error("user not found: unknown error");
  }
}

/**
 * updates user profile
 */
export async function updateUser(
  uid: string,
  updates: {
    displayName?: string;
    photoURL?: string;
    email?: string;
    phoneNumber?: string;
    emailVerified?: boolean;
  }
) {
  try {
    await auth().updateUser(uid, updates);
    return await getUserByUid(uid);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to update user: ${error.message}`);
    }
    throw new Error("failed to update user: unknown error");
  }
}

/**
 * deletes a user
 */
export async function deleteUser(uid: string) {
  try {
    await auth().deleteUser(uid);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to delete user: ${error.message}`);
    }
    throw new Error("failed to delete user: unknown error");
  }
}

/**
 * sets custom claims for a user (for role-based access control)
 */
export async function setUserClaims(uid: string, claims: UserClaims) {
  try {
    await auth().setCustomUserClaims(uid, claims);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to set claims: ${error.message}`);
    }
    throw new Error("failed to set claims: unknown error");
  }
}

/**
 * generates a custom token for a user (for custom auth flows)
 */
export async function createCustomToken(uid: string, claims?: UserClaims) {
  try {
    const customToken = await auth().createCustomToken(uid, claims);
    return customToken;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to create token: ${error.message}`);
    }
    throw new Error("failed to create token: unknown error");
  }
}

/**
 * lists all users (paginated)
 */
export async function listUsers(maxResults: number = 1000, pageToken?: string) {
  try {
    const listUsersResult = await auth().listUsers(maxResults, pageToken);
    return {
      users: listUsersResult.users.map((user) => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber,
        customClaims: user.customClaims as UserClaims,
      })),
      pageToken: listUsersResult.pageToken,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to list users: ${error.message}`);
    }
    throw new Error("failed to list users: unknown error");
  }
}

/**
 * sends email verification link
 */
export async function generateEmailVerificationLink(email: string) {
  try {
    const link = await auth().generateEmailVerificationLink(email);
    return link;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to generate verification link: ${error.message}`);
    }
    throw new Error("failed to generate verification link: unknown error");
  }
}

/**
 * sends password reset email
 */
export async function generatePasswordResetLink(email: string) {
  try {
    const link = await auth().generatePasswordResetLink(email);
    return link;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to generate reset link: ${error.message}`);
    }
    throw new Error("failed to generate reset link: unknown error");
  }
}

/**
 * checks if user has specific role
 */
export async function hasRole(
  uid: string,
  role: "admin" | "user" | "moderator"
): Promise<boolean> {
  try {
    const user = await getUserByUid(uid);
    return user.customClaims?.role === role;
  } catch {
    return false;
  }
}

/**
 * checks if user has specific plan
 */
export async function hasPlan(
  uid: string,
  plan: "free" | "pro" | "enterprise"
): Promise<boolean> {
  try {
    const user = await getUserByUid(uid);
    return user.customClaims?.plan === plan;
  } catch {
    return false;
  }
}

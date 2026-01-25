/**
 * client-side firebase authentication utilities
 * uses firebase client SDK for authentication flows
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber as firebaseSignInWithPhone,
  PhoneAuthProvider,
  signInWithCredential,
  type User,
  type ConfirmationResult,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
} from "firebase/auth";
import { auth } from "./firebase";

export type {
  User,
  ConfirmationResult,
  RecaptchaVerifier,
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

/**
 * signs up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  displayName?: string
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // update display name if provided
    if (displayName && userCredential.user) {
      await firebaseUpdateProfile(userCredential.user, { displayName });
    }

    // send verification email
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }

    return userCredential.user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`signup failed: ${error.message}`);
    }
    throw new Error("signup failed: unknown error");
  }
}

/**
 * signs in with email and password
 */
export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`signin failed: ${error.message}`);
    }
    throw new Error("signin failed: unknown error");
  }
}

/**
 * signs in with google
 */
export async function signInWithGoogle() {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`google signin failed: ${error.message}`);
    }
    throw new Error("google signin failed: unknown error");
  }
}

/**
 * sends email link for passwordless signin
 */
export async function sendEmailLinkForSignIn(email: string) {
  try {
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/verify-email`,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);

    // save email locally to complete signin
    window.localStorage.setItem("emailForSignIn", email);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to send email link: ${error.message}`);
    }
    throw new Error("failed to send email link: unknown error");
  }
}

/**
 * completes email link signin
 */
export async function completeEmailLinkSignIn(email?: string) {
  try {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      throw new Error("invalid email link");
    }

    // get email from localStorage if not provided
    let signInEmail = email;
    if (!signInEmail) {
      const storedEmail = window.localStorage.getItem("emailForSignIn");
      if (!storedEmail) {
        throw new Error("email not found for signin");
      }
      signInEmail = storedEmail;
    }

    const userCredential = await signInWithEmailLink(
      auth,
      signInEmail,
      window.location.href
    );

    // clear email from localStorage
    window.localStorage.removeItem("emailForSignIn");

    return userCredential.user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`email link signin failed: ${error.message}`);
    }
    throw new Error("email link signin failed: unknown error");
  }
}

/**
 * initializes phone auth with recaptcha
 */
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  return new RecaptchaVerifier(auth, containerId, {
    size: "normal",
    callback: () => {
      // recaptcha solved
    },
    "expired-callback": () => {
      // recaptcha expired
    },
  });
}

/**
 * sends verification code to phone number
 */
export async function sendPhoneVerificationCode(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  try {
    const confirmationResult = await firebaseSignInWithPhone(
      auth,
      phoneNumber,
      recaptchaVerifier
    );
    return confirmationResult;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to send code: ${error.message}`);
    }
    throw new Error("failed to send code: unknown error");
  }
}

/**
 * verifies phone code and signs in
 */
export async function verifyPhoneCode(
  confirmationResult: ConfirmationResult,
  code: string
) {
  try {
    const userCredential = await confirmationResult.confirm(code);
    return userCredential.user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`invalid code: ${error.message}`);
    }
    throw new Error("invalid code: unknown error");
  }
}

/**
 * links phone number to existing user
 */
export async function linkPhoneNumber(
  user: User,
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
) {
  try {
    const provider = new PhoneAuthProvider(auth);
    const verificationId = await provider.verifyPhoneNumber(
      phoneNumber,
      recaptchaVerifier
    );
    return verificationId;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to link phone: ${error.message}`);
    }
    throw new Error("failed to link phone: unknown error");
  }
}

/**
 * completes phone number linking with verification code
 */
export async function confirmPhoneLink(
  user: User,
  verificationId: string,
  code: string
) {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, code);
    await signInWithCredential(auth, credential);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to confirm link: ${error.message}`);
    }
    throw new Error("failed to confirm link: unknown error");
  }
}

/**
 * signs out current user
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`signout failed: ${error.message}`);
    }
    throw new Error("signout failed: unknown error");
  }
}

/**
 * sends password reset email
 */
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to send reset email: ${error.message}`);
    }
    throw new Error("failed to send reset email: unknown error");
  }
}

/**
 * sends email verification
 */
export async function sendVerificationEmail(user: User) {
  try {
    await sendEmailVerification(user);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to send verification email: ${error.message}`);
    }
    throw new Error("failed to send verification email: unknown error");
  }
}

/**
 * updates user profile
 */
export async function updateProfile(
  user: User,
  profile: { displayName?: string; photoURL?: string }
) {
  try {
    await firebaseUpdateProfile(user, profile);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to update profile: ${error.message}`);
    }
    throw new Error("failed to update profile: unknown error");
  }
}

/**
 * gets current user's ID token
 */
export async function getIdToken(user: User, forceRefresh: boolean = false) {
  try {
    const token = await user.getIdToken(forceRefresh);
    return token;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to get token: ${error.message}`);
    }
    throw new Error("failed to get token: unknown error");
  }
}

/**
 * gets current user's ID token result with claims
 */
export async function getIdTokenResult(
  user: User,
  forceRefresh: boolean = false
) {
  try {
    const tokenResult = await user.getIdTokenResult(forceRefresh);
    return {
      token: tokenResult.token,
      claims: tokenResult.claims,
      expirationTime: tokenResult.expirationTime,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`failed to get token result: ${error.message}`);
    }
    throw new Error("failed to get token result: unknown error");
  }
}

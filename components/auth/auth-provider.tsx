"use client";

/**
 * authentication context provider
 * provides auth state and methods to all components
 * handles automatic account linking for multiple auth providers
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import * as authClient from "@/lib/auth-client";
import { createOrUpdateUserProfile } from "@/lib/account-linking";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  sendEmailLink: (email: string) => Promise<void>;
  completeEmailLink: (email?: string) => Promise<User>;
  sendPhoneCode: (
    phoneNumber: string,
    recaptchaVerifier: authClient.RecaptchaVerifier
  ) => Promise<authClient.ConfirmationResult>;
  verifyPhoneCode: (
    confirmationResult: authClient.ConfirmationResult,
    code: string
  ) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  updateProfile: (profile: {
    displayName?: string;
    photoURL?: string;
  }) => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  getUserClaims: () => Promise<Record<string, unknown>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(`[AUTH_PROVIDER] Auth state changed:`, {
        isAuthenticated: !!user,
        uid: user?.uid,
        email: user?.email,
        providers: user?.providerData.map((p) => p.providerId),
      });

      if (user) {
        // create or update user profile in Firestore
        try {
          await createOrUpdateUserProfile(user);
          console.log(`[AUTH_PROVIDER] User profile synchronized`);
        } catch (error) {
          console.error(`[AUTH_PROVIDER] Failed to sync user profile:`, error);
        }
      }

      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignUp = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    console.log(`[AUTH_PROVIDER] Sign up started:`, { email, displayName });
    const user = await authClient.signUp(email, password, displayName);
    console.log(`[AUTH_PROVIDER] Sign up successful:`, user.uid);
    return user;
  };

  const handleSignIn = async (email: string, password: string) => {
    console.log(`[AUTH_PROVIDER] Sign in started:`, { email });
    const user = await authClient.signIn(email, password);
    console.log(`[AUTH_PROVIDER] Sign in successful:`, user.uid);
    return user;
  };

  const handleSignInWithGoogle = async () => {
    console.log(`[AUTH_PROVIDER] Google sign in started`);
    const user = await authClient.signInWithGoogle();
    console.log(`[AUTH_PROVIDER] Google sign in successful:`, {
      uid: user.uid,
      email: user.email,
    });
    return user;
  };

  const handleSendEmailLink = async (email: string) => {
    await authClient.sendEmailLinkForSignIn(email);
  };

  const handleCompleteEmailLink = async (email?: string) => {
    const user = await authClient.completeEmailLinkSignIn(email);
    return user;
  };

  const handleSendPhoneCode = async (
    phoneNumber: string,
    recaptchaVerifier: authClient.RecaptchaVerifier
  ) => {
    const result = await authClient.sendPhoneVerificationCode(
      phoneNumber,
      recaptchaVerifier
    );
    return result;
  };

  const handleVerifyPhoneCode = async (
    confirmationResult: authClient.ConfirmationResult,
    code: string
  ) => {
    const user = await authClient.verifyPhoneCode(confirmationResult, code);
    return user;
  };

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  const handleResetPassword = async (email: string) => {
    await authClient.resetPassword(email);
  };

  const handleSendVerificationEmail = async () => {
    if (user) {
      await authClient.sendVerificationEmail(user);
    }
  };

  const handleUpdateProfile = async (profile: {
    displayName?: string;
    photoURL?: string;
  }) => {
    if (user) {
      await authClient.updateProfile(user, profile);
    }
  };

  const handleGetIdToken = async (forceRefresh: boolean = false) => {
    if (user) {
      return await authClient.getIdToken(user, forceRefresh);
    }
    return null;
  };

  const handleGetUserClaims = async () => {
    if (user) {
      const tokenResult = await authClient.getIdTokenResult(user);
      return tokenResult.claims;
    }
    return {};
  };

  const value = {
    user,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithGoogle: handleSignInWithGoogle,
    sendEmailLink: handleSendEmailLink,
    completeEmailLink: handleCompleteEmailLink,
    sendPhoneCode: handleSendPhoneCode,
    verifyPhoneCode: handleVerifyPhoneCode,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    sendVerificationEmail: handleSendVerificationEmail,
    updateProfile: handleUpdateProfile,
    getIdToken: handleGetIdToken,
    getUserClaims: handleGetUserClaims,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

"use client";

/**
 * authentication context provider
 * provides auth state and methods to all components
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import * as authClient from "@/lib/auth-client";

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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
    const user = await authClient.signUp(email, password, displayName);
    return user;
  };

  const handleSignIn = async (email: string, password: string) => {
    const user = await authClient.signIn(email, password);
    return user;
  };

  const handleSignInWithGoogle = async () => {
    const user = await authClient.signInWithGoogle();
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

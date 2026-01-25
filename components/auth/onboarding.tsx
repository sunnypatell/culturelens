"use client";

/**
 * enhanced onboarding flow with account linking
 * collects additional user information and links auth methods
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { setupRecaptcha, type ConfirmationResult } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Phone, Check, ArrowRight } from "lucide-react";

// delay before redirecting to dashboard after successful phone verification
const SUCCESS_REDIRECT_DELAY_MS = 1500;

interface OnboardingProps {
  user: {
    uid: string;
    email?: string | null;
    phoneNumber?: string | null;
    displayName?: string | null;
  };
}

export function Onboarding({ user }: OnboardingProps) {
  const router = useRouter();
  const { user: authUser } = useAuth();

  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasPhone = !!user.phoneNumber;
  const totalSteps = hasPhone ? 1 : 2;

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!authUser) {
        throw new Error("no authenticated user found");
      }

      const recaptchaVerifier = setupRecaptcha(
        "recaptcha-container-onboarding"
      );

      // format phone number
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;

      // link phone number to current user account
      const { linkWithPhoneNumber } = await import("firebase/auth");
      const confirmation = await linkWithPhoneNumber(
        authUser,
        formattedPhone,
        recaptchaVerifier
      );

      setConfirmationResult(confirmation);
      setSuccess("verification code sent!");
      setStep(2);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("failed to send verification code");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!confirmationResult) {
        throw new Error("no verification in progress");
      }

      // confirm the verification code
      await confirmationResult.confirm(verificationCode);

      setSuccess("phone number linked successfully!");
      setTimeout(() => {
        router.push("/dashboard");
      }, SUCCESS_REDIRECT_DELAY_MS);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">welcome to culturelens!</CardTitle>
          <CardDescription>
            let's complete your profile
            {!hasPhone && ` (step ${step} of ${totalSteps})`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPhone ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                <Check className="h-8 w-8 text-white" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">you're all set!</h3>
                <p className="text-sm text-muted-foreground">
                  your account is ready to use
                </p>
              </div>
              <Button onClick={handleSkip} className="mt-4" disabled={loading}>
                continue to dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleSendPhoneCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">phone number (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  add your phone number to enable SMS signin and account
                  recovery
                </p>
              </div>

              <div
                id="recaptcha-container-onboarding"
                className="flex justify-center"
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleSkip}
                  disabled={loading}
                >
                  skip for now
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || !phoneNumber}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Phone className="mr-2 h-4 w-4" />
                  add phone
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyPhone} className="space-y-4">
              <Alert>
                <Phone className="h-4 w-4" />
                <AlertDescription>
                  verification code sent to {phoneNumber}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="code">verification code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  disabled={loading}
                  maxLength={6}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleSkip}
                  disabled={loading}
                >
                  skip for now
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || !verificationCode}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  verify & complete
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

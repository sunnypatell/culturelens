"use client";

/**
 * phone authentication component
 * supports phone number signin with SMS verification code
 */

import { useState, useEffect } from "react";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Phone, ShieldCheck } from "lucide-react";

export function PhoneLogin() {
  const router = useRouter();
  const { sendPhoneCode, verifyPhoneCode } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<ReturnType<
    typeof setupRecaptcha
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    // initialize recaptcha when component mounts
    const verifier = setupRecaptcha("recaptcha-container");
    setRecaptchaVerifier(verifier);

    return () => {
      // cleanup recaptcha when component unmounts
      if (verifier) {
        verifier.clear();
      }
    };
  }, []);

  const formatPhoneNumber = (phone: string) => {
    // ensure phone number starts with +
    if (!phone.startsWith("+")) {
      return `+${phone}`;
    }
    return phone;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!recaptchaVerifier) {
      setError("recaptcha not initialized");
      setLoading(false);
      return;
    }

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const result = await sendPhoneCode(formattedPhone, recaptchaVerifier);
      setConfirmationResult(result);
      setCodeSent(true);
      setSuccess("verification code sent!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("failed to send verification code");
      }
      // reset recaptcha on error
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        const newVerifier = setupRecaptcha("recaptcha-container");
        setRecaptchaVerifier(newVerifier);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!confirmationResult) {
      setError("no confirmation result found");
      setLoading(false);
      return;
    }

    try {
      await verifyPhoneCode(confirmationResult, verificationCode);
      setSuccess("signed in successfully!");
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("invalid verification code");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">sign in with phone</CardTitle>
          <CardDescription>
            enter your phone number to receive a verification code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!codeSent ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">phone number</Label>
                <div className="flex">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    disabled={loading}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  include country code (e.g., +1 for US)
                </p>
              </div>

              {/* Recaptcha Container */}
              <div id="recaptcha-container" className="flex justify-center" />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Phone className="mr-2 h-4 w-4" />
                send verification code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <ShieldCheck className="mr-2 h-4 w-4" />
                verify and sign in
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCodeSent(false);
                  setVerificationCode("");
                  setConfirmationResult(null);
                  if (recaptchaVerifier) {
                    recaptchaVerifier.clear();
                    const newVerifier = setupRecaptcha("recaptcha-container");
                    setRecaptchaVerifier(newVerifier);
                  }
                }}
                disabled={loading}
              >
                use different number
              </Button>
            </form>
          )}

          {/* Error/Success Messages */}
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
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground">
            prefer email?{" "}
            <a href="/auth/login" className="underline">
              sign in with email
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

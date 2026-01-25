"use client";

/**
 * email verification component for passwordless signin
 * completes signin when user clicks email link
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, X } from "lucide-react";

export function VerifyEmail() {
  const router = useRouter();
  const { completeEmailLink } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [needsEmail, setNeedsEmail] = useState(false);

  useEffect(() => {
    // attempt to complete signin automatically
    const completeSignin = async () => {
      try {
        await completeEmailLink();
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("email not found")) {
          setNeedsEmail(true);
          setLoading(false);
        } else {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("failed to complete signin");
          }
          setLoading(false);
        }
      }
    };

    completeSignin();
  }, [completeEmailLink, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await completeEmailLink(emailInput);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("failed to complete signin");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">verify email</CardTitle>
          <CardDescription>completing your signin...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && !needsEmail && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                verifying your email...
              </p>
            </div>
          )}

          {needsEmail && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Alert>
                <AlertDescription>
                  please enter the email address you used to request the signin
                  link
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="email">email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                complete signin
              </Button>
            </form>
          )}

          {success && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                <Check className="h-8 w-8 text-white" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">email verified!</h3>
                <p className="text-sm text-muted-foreground">
                  redirecting to dashboard...
                </p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive">
                <X className="h-8 w-8 text-white" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">verification failed</h3>
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
              <Button asChild variant="outline" className="mt-4">
                <a href="/auth/login">back to sign in</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

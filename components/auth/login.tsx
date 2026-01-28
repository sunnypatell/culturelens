"use client";

/**
 * login component with multiple authentication methods
 * supports email/password, passwordless email link, and phone authentication
 */

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./auth-provider";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Phone, Lock, Sparkles } from "lucide-react";
import { FlipWords } from "@/components/ui/flip-words";
import { motion } from "framer-motion";

export function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    signIn,
    sendEmailLink,
    signInWithGoogle,
    user,
    loading: authLoading,
  } = useAuth();

  // email/password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // passwordless email link state
  const [emailLink, setEmailLink] = useState("");
  const [emailLinkSent, setEmailLinkSent] = useState(false);

  // common state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // redirect to intended destination or dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      // Wait for session cookie to be set by auth-provider before redirecting
      // This prevents redirect loops where middleware sees no cookie
      const checkCookieAndRedirect = () => {
        const hasSessionCookie = document.cookie.includes("session=");
        if (!hasSessionCookie) {
          // Cookie not set yet, wait a bit more
          setTimeout(checkCookieAndRedirect, 50);
          return;
        }

        // check for redirect URL from middleware (includes full path with query params)
        const redirectUrl = searchParams.get("redirectUrl");
        // fallback to simple redirect path
        const redirectPath = searchParams.get("redirect");
        // also check for sessionId that may have been preserved
        const sessionId = searchParams.get("sessionId");

        console.log("[Login] Session cookie set, redirecting...", {
          redirectUrl,
          redirectPath,
          sessionId,
        });

        if (redirectUrl) {
          // full URL was preserved - use it directly
          router.push(redirectUrl);
        } else if (redirectPath) {
          // build the redirect with sessionId if available
          const finalUrl = sessionId
            ? `${redirectPath}?sessionId=${sessionId}`
            : redirectPath;
          router.push(finalUrl);
        } else {
          router.push("/");
        }
      };

      // Start checking after a small initial delay
      const timeoutId = setTimeout(checkCookieAndRedirect, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [user, authLoading, router, searchParams]);

  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await signIn(email, password);
      setSuccess("Signed in successfully! Redirecting...");
      // Don't manually redirect - let the auth state change handle it
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to sign in");
      }
      setLoading(false);
    }
  };

  const handleEmailLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await sendEmailLink(emailLink);
      setEmailLinkSent(true);
      setSuccess("Check your email for the sign-in link!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send email link");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await signInWithGoogle();
      setSuccess("Signed in with Google! Redirecting...");
      // Don't manually redirect - let the auth state change handle it
      // The main page will automatically redirect when user is authenticated
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to sign in with Google");
      }
      setLoading(false);
    }
  };

  const flipWords = [
    "Understanding",
    "Cultural Awareness",
    "Empathy",
    "Connection",
    "Insight",
  ];

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-primary/10 to-accent/10" />

      {/* Floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section - Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-lg space-y-8"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex items-center gap-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-xl shadow-primary/50">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              CultureLens
            </h1>
          </motion.div>

          {/* FlipWords Section */}
          <div className="space-y-4">
            <div className="text-6xl font-bold leading-tight">
              <div className="text-foreground">Through Listening</div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-foreground/80">Build</span>
                <FlipWords words={flipWords} className="text-primary" />
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-muted-foreground leading-relaxed"
            >
              A consent-based conversation mirror with cultural awareness
              powered by AI
            </motion.p>
          </div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap gap-3"
          >
            {["Real-time Analysis", "Cultural Insights", "Privacy First"].map(
              (feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-white/20 backdrop-blur-sm text-sm font-medium"
                >
                  {feature}
                </motion.div>
              )
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Auth Card - Right Side */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-xl bg-background/80 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Sign In to CultureLens</CardTitle>
              <CardDescription>
                Choose your preferred sign-in method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="email">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="passwordless">
                    <Lock className="mr-2 h-4 w-4" />
                    Link
                  </TabsTrigger>
                  <TabsTrigger value="phone">
                    <Phone className="mr-2 h-4 w-4" />
                    Phone
                  </TabsTrigger>
                </TabsList>

                {/* Email/Password Tab */}
                <TabsContent value="email">
                  <form
                    onSubmit={handleEmailPasswordSignIn}
                    className="space-y-4"
                    aria-describedby={error ? "auth-error" : undefined}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                {/* Passwordless Email Link Tab */}
                <TabsContent value="passwordless">
                  {!emailLinkSent ? (
                    <form
                      onSubmit={handleEmailLinkSignIn}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="emailLink">Email</Label>
                        <Input
                          id="emailLink"
                          type="email"
                          placeholder="you@example.com"
                          value={emailLink}
                          onChange={(e) => setEmailLink(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                      >
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Send Sign-In Link
                      </Button>
                    </form>
                  ) : (
                    <Alert>
                      <Mail className="h-4 w-4" />
                      <AlertDescription>
                        Check your email for the sign-in link. Click it to
                        complete sign-in.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                {/* Phone Auth Tab */}
                <TabsContent value="phone">
                  <Alert>
                    <Phone className="h-4 w-4" />
                    <AlertDescription>
                      Phone authentication requires reCAPTCHA verification. Use
                      the dedicated{" "}
                      <a href="/auth/phone" className="underline">
                        phone sign-in page
                      </a>
                      .
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>

              {/* Google Sign-In */}
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or Continue With
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                  </svg>
                  Sign In with Google
                </Button>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <Alert
                  variant="destructive"
                  className="mt-4"
                  id="auth-error"
                  role="alert"
                >
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mt-4">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 border-t border-white/10 bg-background/50">
              <div className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <a
                  href="/auth/signup"
                  className="underline text-primary hover:text-accent transition-colors"
                >
                  Sign up
                </a>
              </div>
              <div className="text-sm text-muted-foreground">
                Forgot password?{" "}
                <a
                  href="/auth/reset-password"
                  className="underline text-primary hover:text-accent transition-colors"
                >
                  Reset it
                </a>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

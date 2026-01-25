"use client";

/**
 * signup component for creating new accounts
 * supports email/password registration with email verification
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Mail, Check, CheckCircle2, XCircle } from "lucide-react";
import {
  checkPasswordStrength,
  getStrengthColor,
  getStrengthTextColor,
} from "@/lib/password-strength";

// delay before redirecting to onboarding after successful signup
const SUCCESS_REDIRECT_DELAY_MS = 2000;

export function Signup() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormData = {
      ...formData,
      [e.target.id]: e.target.value,
    };
    setFormData(newFormData);

    console.log(`[SIGNUP_FORM] Field changed:`, {
      field: e.target.id,
      value: e.target.id === 'password' ? '***' : e.target.value,
    });
  };

  const passwordStrength = useMemo(
    () => checkPasswordStrength(formData.password),
    [formData.password]
  );

  const validateForm = () => {
    console.log(`[SIGNUP_VALIDATION] Starting form validation`);

    if (!formData.displayName.trim()) {
      console.error(`[SIGNUP_VALIDATION] Validation failed: missing display name`);
      setError("Please enter your display name");
      return false;
    }
    if (!formData.email.trim()) {
      console.error(`[SIGNUP_VALIDATION] Validation failed: missing email`);
      setError("Please enter your email");
      return false;
    }
    if (!passwordStrength.isValid) {
      console.error(`[SIGNUP_VALIDATION] Validation failed: password does not meet requirements`, {
        strength: passwordStrength.strength,
        score: passwordStrength.score,
        unmetRequirements: passwordStrength.requirements
          .filter((req) => !req.met)
          .map((req) => req.label),
      });
      setError("Password does not meet all requirements");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      console.error(`[SIGNUP_VALIDATION] Validation failed: passwords do not match`);
      setError("Passwords do not match");
      return false;
    }
    if (!agreedToTerms) {
      console.error(`[SIGNUP_VALIDATION] Validation failed: terms not agreed`);
      setError("Please agree to the Terms and Conditions");
      return false;
    }

    console.log(`[SIGNUP_VALIDATION] Form validation successful`);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    console.log(`[SIGNUP_SUBMIT] Form submission started`, {
      displayName: formData.displayName,
      email: formData.email,
      passwordStrength: passwordStrength.strength,
      agreedToTerms,
    });

    if (!validateForm()) {
      console.error(`[SIGNUP_SUBMIT] Form validation failed, aborting submission`);
      return;
    }

    setLoading(true);
    console.log(`[SIGNUP_SUBMIT] Calling Firebase signUp...`);

    try {
      await signUp(formData.email, formData.password, formData.displayName);
      console.log(`[SIGNUP_SUBMIT] Successfully created account for:`, formData.email);
      setSuccess(true);

      // redirect to onboarding to complete profile
      console.log(`[SIGNUP_SUBMIT] Redirecting to onboarding in ${SUCCESS_REDIRECT_DELAY_MS}ms`);
      setTimeout(() => {
        router.push("/onboarding");
      }, SUCCESS_REDIRECT_DELAY_MS);
    } catch (err: unknown) {
      console.error(`[SIGNUP_SUBMIT] Failed to create account:`, err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-primary/5 to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>
            Join CultureLens and start your journey
          </CardDescription>
        </CardHeader>
        {!success ? (
          <>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
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
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      {/* Strength Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">Password Strength</span>
                          <span className={`text-xs font-semibold ${getStrengthTextColor(passwordStrength.strength)}`}>
                            {passwordStrength.strength.toUpperCase()}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength.strength)}`}
                            style={{ width: `${passwordStrength.score}%` }}
                          />
                        </div>
                      </div>

                      {/* Requirements Checklist */}
                      <div className="space-y-1 pt-1">
                        {passwordStrength.requirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            {req.met ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span className={req.met ? "text-green-600" : "text-muted-foreground"}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) =>
                      setAgreedToTerms(checked === true)
                    }
                    disabled={loading}
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <a href="/terms" className="underline" target="_blank">
                      Terms and Conditions
                    </a>
                  </Label>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <a href="/auth/login" className="underline">
                  Sign in
                </a>
              </div>
            </CardFooter>
          </>
        ) : (
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
              <Check className="h-8 w-8 text-white" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Account Created!</h3>
              <p className="text-sm text-muted-foreground">
                Verification email sent to {formData.email}
              </p>
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                Check your inbox
              </div>
              <p className="text-xs text-muted-foreground pt-4">
                Redirecting to dashboard...
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

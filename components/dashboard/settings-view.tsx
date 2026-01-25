"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Footer } from "./footer";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function SettingsView() {
  const { user, getIdToken, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // profile state
  const [displayName, setDisplayName] = useState("");
  const [organization, setOrganization] = useState("");

  // settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [culturalAnalysis, setCulturalAnalysis] = useState(true);
  const [dataRetention, setDataRetention] = useState("90");
  const [sensitivityLevel, setSensitivityLevel] = useState([70]);
  const [theme, setTheme] = useState("system");

  // password dialog state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDisplayName(user?.displayName || "");
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const token = await getIdToken();

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          organization,
        }),
      });

      if (!response.ok) {
        throw new Error("failed to update profile");
      }

      toast.success("profile updated successfully");
    } catch (error) {
      console.error("[SettingsView] Profile update error:", error);
      toast.error("failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const token = await getIdToken();

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notifications: notificationsEnabled,
          autoSave: autoSaveEnabled,
          culturalAnalysis,
          dataRetention,
          sensitivityLevel: sensitivityLevel[0] / 20,
          theme,
        }),
      });

      if (!response.ok) {
        throw new Error("failed to save settings");
      }

      toast.success("settings saved successfully");
    } catch (error) {
      console.error("[SettingsView] Settings save error:", error);
      toast.error("failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      const token = await getIdToken();

      const response = await fetch("/api/user/export", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("failed to export data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `culturelens-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("data exported successfully");
    } catch (error) {
      console.error("[SettingsView] Export error:", error);
      toast.error("failed to export data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "are you sure you want to delete your account? this action cannot be undone and will delete all your sessions and data."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const token = await getIdToken();

      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("failed to delete account");
      }

      toast.success("account deleted successfully");
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("[SettingsView] Delete account error:", error);
      toast.error("failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-60 left-60 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-60 right-60 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <div className="relative z-10 p-8 space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div
          className={cn(
            "space-y-2",
            mounted && "animate-in fade-in slide-in-from-bottom-8 duration-700"
          )}
        >
          <h1 className="text-5xl font-bold text-foreground tracking-tight">
            Settings
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage your account preferences and privacy settings
          </p>
        </div>

        {/* Account Section */}
        <Card
          className={cn(
            "p-8",
            mounted &&
              "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100"
          )}
        >
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Account Information
              </h2>
              <p className="text-sm text-muted-foreground">
                Update your personal details and profile
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  defaultValue={user?.email || ""}
                  disabled
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization" className="text-base font-medium">
                Organization (Optional)
              </Label>
              <Input
                id="organization"
                placeholder="Ontario Tech University"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSaveProfile} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Dialog
                open={showPasswordDialog}
                onOpenChange={setShowPasswordDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Change Password</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>change password</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      to change your password, please use the password reset
                      feature from the login page
                    </p>
                    <Button
                      onClick={() => {
                        router.push("/auth/reset-password");
                      }}
                      className="w-full"
                    >
                      go to password reset
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>

        {/* Recording Preferences */}
        <Card
          className={cn(
            "p-8",
            mounted &&
              "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200"
          )}
        >
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Recording Preferences
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure your default recording settings
              </p>
            </div>

            <Separator />

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                <div className="space-y-1">
                  <Label
                    htmlFor="auto-save"
                    className="text-base font-medium cursor-pointer"
                  >
                    Auto-Save Recordings
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save recordings when stopped
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={autoSaveEnabled}
                  onCheckedChange={setAutoSaveEnabled}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                <div className="space-y-1">
                  <Label
                    htmlFor="notifications"
                    className="text-base font-medium cursor-pointer"
                  >
                    Enable Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when analysis is complete
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    Default Audio Quality
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Higher quality means larger file sizes
                  </p>
                </div>
                <RadioGroup defaultValue="high">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        value: "standard",
                        label: "Standard",
                        desc: "128 kbps • Smaller files",
                      },
                      {
                        value: "high",
                        label: "High",
                        desc: "256 kbps • Recommended",
                      },
                      {
                        value: "maximum",
                        label: "Maximum",
                        desc: "320 kbps • Best quality",
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={cn(
                          "flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50",
                          "border-border"
                        )}
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                        />
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {option.label}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {option.desc}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </Card>

        {/* Analysis Configuration */}
        <Card
          className={cn(
            "p-8",
            mounted &&
              "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300"
          )}
        >
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Analysis Configuration
              </h2>
              <p className="text-sm text-muted-foreground">
                Customize how CultureLens analyzes your conversations
              </p>
            </div>

            <Separator />

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                <div className="space-y-1">
                  <Label
                    htmlFor="cultural-analysis"
                    className="text-base font-medium cursor-pointer"
                  >
                    Enable Cultural Context Analysis
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Analyze communication through cultural awareness lens
                  </p>
                </div>
                <Switch
                  id="cultural-analysis"
                  checked={culturalAnalysis}
                  onCheckedChange={setCulturalAnalysis}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Cultural Sensitivity Level
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Adjust how much cultural context influences insights
                    </p>
                  </div>
                  <Badge className="text-base px-4 py-1.5">
                    {sensitivityLevel[0]}%
                  </Badge>
                </div>
                <Slider
                  value={sensitivityLevel}
                  onValueChange={setSensitivityLevel}
                  max={100}
                  step={1}
                  className="w-full"
                  disabled={!culturalAnalysis}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Less Context</span>
                  <span>More Context</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Focus Areas</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select what aspects to prioritize in analysis
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "Turn-Taking",
                    "Question Patterns",
                    "Speaking Pace",
                    "Interruptions",
                    "Topic Transitions",
                    "Emotional Tone",
                  ].map((focus) => (
                    <Button
                      key={focus}
                      variant="outline"
                      className="justify-start h-auto py-3 bg-transparent"
                    >
                      <div className="w-4 h-4 rounded border-2 border-primary mr-3 flex-shrink-0" />
                      {focus}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy & Data */}
        <Card
          className={cn(
            "p-8 border-amber-200 dark:border-amber-900 bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20",
            mounted &&
              "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400"
          )}
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-amber-600 dark:text-amber-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Privacy & Data Management
                </h2>
                <p className="text-sm text-muted-foreground">
                  Control how your data is stored and used
                </p>
              </div>
            </div>

            <Separator className="bg-amber-200 dark:bg-amber-900" />

            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    Data Retention Period
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    How long to keep recordings and insights
                  </p>
                </div>
                <RadioGroup
                  value={dataRetention}
                  onValueChange={setDataRetention}
                >
                  <div className="space-y-3">
                    {[
                      {
                        value: "30",
                        label: "30 Days",
                        desc: "Automatically delete after 1 month",
                      },
                      {
                        value: "90",
                        label: "90 Days",
                        desc: "Automatically delete after 3 months (Recommended)",
                      },
                      {
                        value: "365",
                        label: "1 Year",
                        desc: "Automatically delete after 1 year",
                      },
                      {
                        value: "manual",
                        label: "Manual Only",
                        desc: "Keep until manually deleted",
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-amber-500/50 border-amber-200 dark:border-amber-900 bg-white dark:bg-amber-950/10"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                        />
                        <div className="space-y-1 flex-1">
                          <div className="font-medium text-foreground">
                            {option.label}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {option.desc}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={handleExportData}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <svg
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  )}
                  Download My Data
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <svg
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  )}
                  Delete All Data
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card
          className={cn(
            "p-8",
            mounted &&
              "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500"
          )}
        >
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Appearance
              </h2>
              <p className="text-sm text-muted-foreground">
                Customize how CultureLens looks
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-base font-medium">Theme</Label>
              <RadioGroup value={theme} onValueChange={setTheme}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: "light", label: "Light", icon: SunIcon },
                    { value: "dark", label: "Dark", icon: MoonIcon },
                    { value: "system", label: "System", icon: MonitorIcon },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <label
                        key={option.value}
                        className={cn(
                          "flex flex-col items-center space-y-3 p-6 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50",
                          theme === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        )}
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          className="sr-only"
                        />
                        <Icon className="w-8 h-8 text-muted-foreground" />
                        <div className="font-medium text-foreground">
                          {option.label}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

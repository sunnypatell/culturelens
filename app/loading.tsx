import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div
      className="flex h-screen items-center justify-center bg-background"
      role="status"
      aria-label="Loading"
    >
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
      <span className="sr-only">Loading application</span>
    </div>
  );
}

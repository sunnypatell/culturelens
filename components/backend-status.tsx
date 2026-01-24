"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { checkBackendHealth, type HealthStatus } from "@/lib/api-client";

export function BackendStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">(
    "checking"
  );
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // check every 30s
    return () => clearInterval(interval);
  }, []);

  async function checkHealth() {
    const result = await checkBackendHealth();

    if (result.error) {
      setStatus("error");
      setError(result.error);
      setHealth(null);
    } else if (result.data) {
      setStatus("connected");
      setHealth(result.data);
      setError(null);
    }
  }

  if (status === "checking") {
    return (
      <Badge variant="outline" className="gap-1.5">
        <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-xs">checking backend...</span>
      </Badge>
    );
  }

  if (status === "error") {
    return (
      <Badge variant="destructive" className="gap-1.5">
        <div className="h-2 w-2 rounded-full bg-red-500" />
        <span className="text-xs" title={error || undefined}>
          backend offline
        </span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1.5 bg-green-50 border-green-200">
      <div className="h-2 w-2 rounded-full bg-green-500" />
      <span className="text-xs text-green-700">
        backend connected {health?.version && `(v${health.version})`}
      </span>
    </Badge>
  );
}

/**
 * api client for backend communication
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
  version: string;
}

export interface BackendSession {
  id: string;
  createdAt: string;
  consent: {
    personA: boolean;
    personB: boolean;
    timestamp: string;
  };
  settings: {
    storageMode: "ephemeral" | "transcriptOnly" | "full";
    voiceId: string;
    commTags: string[];
  };
  status: "recording" | "processing" | "ready" | "failed";
}

/**
 * health check to verify backend connectivity
 */
export async function checkBackendHealth(): Promise<ApiResponse<HealthStatus>> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return { error: `backend returned ${response.status}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "failed to connect to backend",
    };
  }
}

/**
 * created a new session in the backend
 */
export async function createSession(
  consent: { personA: boolean; personB: boolean },
  settings: {
    storageMode?: "ephemeral" | "transcriptOnly" | "full";
    voiceId?: string;
    commTags?: string[];
  }
): Promise<ApiResponse<{ session: BackendSession; message: string }>> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        consent: {
          personA: consent.personA,
          personB: consent.personB,
          timestamp: new Date().toISOString(),
        },
        settings: {
          storageMode: settings.storageMode || "ephemeral",
          voiceId: settings.voiceId || "",
          commTags: settings.commTags || [],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.detail || `backend returned ${response.status}`,
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "failed to create session",
    };
  }
}

/**
 * get all sessions
 */
export async function listSessions(): Promise<ApiResponse<BackendSession[]>> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/sessions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return { error: `backend returned ${response.status}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "failed to fetch sessions",
    };
  }
}

/**
 * get session by id
 */
export async function getSession(
  sessionId: string
): Promise<ApiResponse<BackendSession>> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/v1/sessions/${sessionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return { error: `backend returned ${response.status}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "failed to fetch session",
    };
  }
}

/**
 * delete session
 */
export async function deleteSession(
  sessionId: string
): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/v1/sessions/${sessionId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return { error: `backend returned ${response.status}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "failed to delete session",
    };
  }
}

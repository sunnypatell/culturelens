import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkBackendHealth,
  createSession,
  listSessions,
  getSession,
  deleteSession,
} from "@/lib/api-client";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("checkBackendHealth", () => {
  it("returns health data on success", async () => {
    const healthData = {
      status: "ok",
      timestamp: "2026-01-28T00:00:00Z",
      service: "culturelens-backend",
      version: "0.1.0",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => healthData,
    });

    const result = await checkBackendHealth();
    expect(result.data).toEqual(healthData);
    expect(result.error).toBeUndefined();
  });

  it("returns error on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const result = await checkBackendHealth();
    expect(result.error).toBe("backend returned 503");
  });

  it("returns error on network failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("fetch failed"));

    const result = await checkBackendHealth();
    expect(result.error).toBe("fetch failed");
  });

  it("returns generic error for non-Error exceptions", async () => {
    mockFetch.mockRejectedValueOnce("unknown");

    const result = await checkBackendHealth();
    expect(result.error).toBe("failed to connect to backend");
  });
});

describe("createSession", () => {
  it("sends consent and settings in request body", async () => {
    const session = { id: "s1", status: "recording" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session, message: "created" }),
    });

    await createSession(
      { personA: true, personB: true },
      { storageMode: "transcriptOnly", voiceId: "v1", commTags: ["direct"] }
    );

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v1/sessions");
    expect(options.method).toBe("POST");

    const body = JSON.parse(options.body);
    expect(body.consent.personA).toBe(true);
    expect(body.consent.personB).toBe(true);
    expect(body.settings.storageMode).toBe("transcriptOnly");
  });

  it("uses defaults when settings are omitted", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: {}, message: "created" }),
    });

    await createSession({ personA: true, personB: true }, {});

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.settings.storageMode).toBe("ephemeral");
    expect(body.settings.voiceId).toBe("");
    expect(body.settings.commTags).toEqual([]);
  });

  it("returns error details from response body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: "consent required" }),
    });

    const result = await createSession(
      { personA: false, personB: false },
      {}
    );
    expect(result.error).toBe("consent required");
  });
});

describe("listSessions", () => {
  it("returns session array on success", async () => {
    const sessions = [
      { id: "s1", status: "ready" },
      { id: "s2", status: "processing" },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sessions,
    });

    const result = await listSessions();
    expect(result.data).toHaveLength(2);
    expect(result.data![0].id).toBe("s1");
  });
});

describe("getSession", () => {
  it("requests correct session by id", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "abc123", status: "ready" }),
    });

    await getSession("abc123");
    expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/sessions/abc123");
  });

  it("returns error for missing session", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    const result = await getSession("nonexistent");
    expect(result.error).toBe("backend returned 404");
  });
});

describe("deleteSession", () => {
  it("sends DELETE request", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "deleted" }),
    });

    await deleteSession("abc123");
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v1/sessions/abc123");
    expect(options.method).toBe("DELETE");
  });
});

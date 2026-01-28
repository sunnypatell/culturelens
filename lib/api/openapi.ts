// OpenAPI 3.1.0 specification for CultureLens API
// auto-serves at /api/docs via Scalar interactive explorer

const API_VERSION = "0.2.0";

const bearerAuth = {
  type: "http" as const,
  scheme: "bearer",
  bearerFormat: "Firebase JWT",
  description:
    "Firebase ID token obtained from client-side authentication. Include as `Authorization: Bearer <token>`.",
};

const errorResponse = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: {
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const, example: false },
          error: {
            type: "object" as const,
            properties: {
              code: { type: "string" as const },
              message: { type: "string" as const },
              details: { type: "string" as const },
              hint: { type: "string" as const },
            },
            required: ["code", "message"],
          },
        },
        required: ["success", "error"],
      },
    },
  },
});

const successResponse = (
  description: string,
  dataSchema: Record<string, unknown>
) => ({
  description,
  content: {
    "application/json": {
      schema: {
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const, example: true },
          data: dataSchema,
          message: { type: "string" as const },
          meta: { type: "object" as const },
        },
        required: ["success", "data"],
      },
    },
  },
});

const sessionObject = {
  type: "object" as const,
  properties: {
    id: { type: "string" as const, example: "abc123" },
    title: {
      type: "string" as const,
      example: "cross-cultural communication session",
    },
    status: {
      type: "string" as const,
      enum: ["active", "completed", "analyzed"],
    },
    createdAt: { type: "string" as const, format: "date-time" },
    updatedAt: { type: "string" as const, format: "date-time" },
    isFavorite: { type: "boolean" as const },
    settings: {
      type: "object" as const,
      properties: {
        storageMode: {
          type: "string" as const,
          enum: ["ephemeral", "transcriptOnly"],
        },
        voiceId: { type: "string" as const },
        analysisDepth: {
          type: "string" as const,
          enum: ["quick", "standard", "deep"],
        },
        culturalContextTags: {
          type: "array" as const,
          items: { type: "string" as const },
        },
        sensitivityLevel: {
          type: "integer" as const,
          minimum: 0,
          maximum: 5,
        },
      },
    },
  },
};

const analysisObject = {
  type: "object" as const,
  properties: {
    sessionId: { type: "string" as const },
    metrics: { type: "object" as const },
    insights: {
      type: "array" as const,
      items: { type: "object" as const },
    },
    debrief: { type: "string" as const },
    analyzedAt: { type: "string" as const, format: "date-time" },
  },
};

export function buildOpenAPISpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: "CultureLens API",
      version: API_VERSION,
      description: `consent-based conversation analytics platform with cultural awareness.

CultureLens provides real-time voice conversation analysis powered by Google Gemini 2.5 Flash,
ElevenLabs voice synthesis, and Firebase authentication. all endpoints return a consistent
\`{ success, data }\` or \`{ success, error }\` envelope.

## authentication
most endpoints require a Firebase Bearer token. obtain one via client-side Firebase Auth,
then include it as \`Authorization: Bearer <token>\` in your requests.

## rate limiting
API requests are rate-limited per user. see response headers for limit details.

## error codes
| code | status | description |
|------|--------|-------------|
| \`BAD_REQUEST\` | 400 | invalid request parameters |
| \`VALIDATION_ERROR\` | 400 | request body failed schema validation |
| \`UNAUTHORIZED\` | 401 | missing or invalid auth token |
| \`INVALID_TOKEN\` | 401 | expired or malformed JWT |
| \`FORBIDDEN\` | 403 | insufficient permissions |
| \`NOT_FOUND\` | 404 | resource does not exist |
| \`CONFLICT\` | 409 | resource state conflict |
| \`INTERNAL_ERROR\` | 500 | unexpected server error |
| \`SERVICE_UNAVAILABLE\` | 503 | downstream service unavailable |
| \`DATABASE_ERROR\` | 503 | firestore operation failed |
| \`EXTERNAL_SERVICE_ERROR\` | 503 | third-party API error |`,
      contact: {
        name: "Sunny Patel",
        url: "https://github.com/sunnypatell",
      },
      license: {
        name: "Proprietary",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "local development",
      },
    ],
    tags: [
      {
        name: "sessions",
        description: "create, manage, and query conversation sessions",
      },
      {
        name: "analysis",
        description:
          "trigger and retrieve AI-powered cultural communication analysis",
      },
      {
        name: "audio",
        description: "upload and retrieve session audio recordings",
      },
      {
        name: "elevenlabs",
        description: "text-to-speech and voice agent integration",
      },
      {
        name: "user",
        description: "user profile, data export, and account management",
      },
      {
        name: "auth",
        description: "authentication and role management",
      },
      {
        name: "settings",
        description: "user preferences and application settings",
      },
      {
        name: "transcripts",
        description: "conversation transcript storage",
      },
      {
        name: "health",
        description: "service health and dependency status",
      },
    ],
    paths: {
      // --- sessions ---
      "/api/sessions": {
        post: {
          tags: ["sessions"],
          summary: "create a new session",
          description:
            "creates a new conversation session with consent verification and recording settings.",
          operationId: "createSession",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["consent", "settings"],
                  properties: {
                    consent: {
                      type: "object",
                      required: ["personA", "personB"],
                      properties: {
                        personA: {
                          type: "boolean",
                          description: "participant A consent",
                        },
                        personB: {
                          type: "boolean",
                          description: "participant B consent",
                        },
                        timestamp: {
                          type: "string",
                          format: "date-time",
                        },
                      },
                    },
                    settings: {
                      type: "object",
                      required: ["storageMode", "voiceId"],
                      properties: {
                        storageMode: {
                          type: "string",
                          enum: ["ephemeral", "transcriptOnly"],
                        },
                        voiceId: { type: "string" },
                        title: { type: "string" },
                        sessionType: { type: "string" },
                        participantCount: { type: "integer" },
                        analysisMethod: {
                          type: "string",
                          enum: ["quick", "standard", "deep"],
                        },
                        analysisDepth: {
                          type: "string",
                          enum: ["quick", "standard", "deep"],
                        },
                        culturalContextTags: {
                          type: "array",
                          items: { type: "string" },
                        },
                        sensitivityLevel: {
                          type: "integer",
                          minimum: 0,
                          maximum: 5,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": successResponse("session created", sessionObject),
            "400": errorResponse("invalid request body"),
            "401": errorResponse("authentication required"),
          },
        },
        get: {
          tags: ["sessions"],
          summary: "list all sessions",
          description:
            "retrieves all sessions for the authenticated user, sorted by most recent.",
          operationId: "listSessions",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": successResponse("sessions list", {
              type: "array",
              items: sessionObject,
            }),
            "401": errorResponse("authentication required"),
          },
        },
      },
      "/api/sessions/{id}": {
        get: {
          tags: ["sessions"],
          summary: "get session by ID",
          operationId: "getSession",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": successResponse("session details", sessionObject),
            "404": errorResponse("session not found"),
          },
        },
        patch: {
          tags: ["sessions"],
          summary: "update session",
          operationId: "updateSession",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    status: {
                      type: "string",
                      enum: ["active", "completed", "analyzed"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": successResponse("session updated", sessionObject),
            "404": errorResponse("session not found"),
          },
        },
        delete: {
          tags: ["sessions"],
          summary: "delete session",
          operationId: "deleteSession",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": successResponse("session deleted", {
              type: "object",
              properties: { deleted: { type: "boolean" } },
            }),
            "404": errorResponse("session not found"),
          },
        },
      },
      "/api/sessions/{id}/favorite": {
        patch: {
          tags: ["sessions"],
          summary: "toggle session favorite",
          operationId: "toggleFavorite",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": successResponse("favorite toggled", {
              type: "object",
              properties: { isFavorite: { type: "boolean" } },
            }),
            "404": errorResponse("session not found"),
          },
        },
      },
      // --- analysis ---
      "/api/sessions/{id}/analyze": {
        post: {
          tags: ["analysis"],
          summary: "trigger analysis",
          description:
            "initiates AI-powered cultural communication analysis using Google Gemini 2.5 Flash.",
          operationId: "triggerAnalysis",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": successResponse("analysis started", analysisObject),
            "404": errorResponse("session not found"),
            "503": errorResponse("Gemini service unavailable"),
          },
        },
        get: {
          tags: ["analysis"],
          summary: "get analysis results",
          operationId: "getAnalysis",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": successResponse("analysis results", analysisObject),
            "404": errorResponse("analysis not found"),
          },
        },
      },
      // --- audio ---
      "/api/sessions/{id}/upload": {
        post: {
          tags: ["audio"],
          summary: "upload session audio",
          operationId: "uploadAudio",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    audio: { type: "string", format: "binary" },
                  },
                  required: ["audio"],
                },
              },
            },
          },
          responses: {
            "200": successResponse("audio uploaded", {
              type: "object",
              properties: { url: { type: "string", format: "uri" } },
            }),
            "400": errorResponse("invalid audio file"),
          },
        },
      },
      "/api/audio/{id}": {
        get: {
          tags: ["audio"],
          summary: "get audio by ID",
          operationId: "getAudio",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "audio stream",
              content: {
                "audio/webm": { schema: { type: "string", format: "binary" } },
              },
            },
            "404": errorResponse("audio not found"),
          },
        },
      },
      // --- elevenlabs ---
      "/api/elevenlabs/tts": {
        post: {
          tags: ["elevenlabs"],
          summary: "text-to-speech synthesis",
          description:
            "converts text to speech using ElevenLabs voice synthesis API.",
          operationId: "textToSpeech",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["text"],
                  properties: {
                    text: {
                      type: "string",
                      minLength: 1,
                      maxLength: 5000,
                    },
                    voiceId: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "audio stream",
              content: {
                "audio/mpeg": { schema: { type: "string", format: "binary" } },
              },
            },
            "503": errorResponse("ElevenLabs service unavailable"),
          },
        },
      },
      "/api/elevenlabs/signed-url": {
        get: {
          tags: ["elevenlabs"],
          summary: "get signed WebSocket URL",
          description:
            "retrieves a signed URL for real-time voice agent WebSocket connection.",
          operationId: "getSignedUrl",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": successResponse("signed URL", {
              type: "object",
              properties: { signedUrl: { type: "string", format: "uri" } },
            }),
            "503": errorResponse("ElevenLabs service unavailable"),
          },
        },
      },
      // --- user ---
      "/api/user/profile": {
        patch: {
          tags: ["user"],
          summary: "update user profile",
          operationId: "updateProfile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    displayName: { type: "string" },
                    photoURL: { type: "string", format: "uri" },
                  },
                },
              },
            },
          },
          responses: {
            "200": successResponse("profile updated", {
              type: "object",
              properties: {
                uid: { type: "string" },
                displayName: { type: "string" },
                email: { type: "string" },
              },
            }),
          },
        },
      },
      "/api/user/sync-profile": {
        post: {
          tags: ["user"],
          summary: "sync user profile to firestore",
          operationId: "syncProfile",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": successResponse("profile synced", {
              type: "object",
              properties: { synced: { type: "boolean" } },
            }),
          },
        },
        get: {
          tags: ["user"],
          summary: "get synced profile",
          operationId: "getSyncedProfile",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": successResponse("synced profile data", {
              type: "object",
            }),
          },
        },
      },
      "/api/user/export": {
        post: {
          tags: ["user"],
          summary: "export user data (GDPR)",
          description:
            "exports all user data in a downloadable format for GDPR compliance.",
          operationId: "exportUserData",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": successResponse("user data export", {
              type: "object",
            }),
          },
        },
      },
      "/api/user/delete": {
        delete: {
          tags: ["user"],
          summary: "delete user account",
          description:
            "permanently deletes the user account and all associated data.",
          operationId: "deleteAccount",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": successResponse("account deleted", {
              type: "object",
              properties: { deleted: { type: "boolean" } },
            }),
          },
        },
      },
      // --- auth ---
      "/api/auth/user": {
        get: {
          tags: ["auth"],
          summary: "get current user",
          operationId: "getCurrentUser",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": successResponse("current user info", {
              type: "object",
              properties: {
                uid: { type: "string" },
                email: { type: "string" },
                displayName: { type: "string" },
                role: { type: "string" },
              },
            }),
            "401": errorResponse("not authenticated"),
          },
        },
      },
      "/api/auth/admin/roles": {
        post: {
          tags: ["auth"],
          summary: "assign user role (admin only)",
          operationId: "assignRole",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["uid", "role"],
                  properties: {
                    uid: { type: "string" },
                    role: {
                      type: "string",
                      enum: ["user", "admin"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": successResponse("role assigned", {
              type: "object",
              properties: {
                uid: { type: "string" },
                role: { type: "string" },
              },
            }),
            "403": errorResponse("admin access required"),
          },
        },
      },
      // --- settings ---
      "/api/settings": {
        get: {
          tags: ["settings"],
          summary: "get user settings",
          operationId: "getSettings",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": successResponse("user settings", {
              type: "object",
              properties: {
                theme: { type: "string", enum: ["light", "dark", "system"] },
                notifications: { type: "boolean" },
                language: { type: "string" },
              },
            }),
          },
        },
        put: {
          tags: ["settings"],
          summary: "update user settings",
          operationId: "updateSettings",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    theme: {
                      type: "string",
                      enum: ["light", "dark", "system"],
                    },
                    notifications: { type: "boolean" },
                    language: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": successResponse("settings updated", {
              type: "object",
            }),
          },
        },
      },
      // --- transcripts ---
      "/api/transcripts": {
        post: {
          tags: ["transcripts"],
          summary: "create transcript",
          operationId: "createTranscript",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["sessionId", "transcript"],
                  properties: {
                    sessionId: { type: "string", minLength: 1 },
                    transcript: { type: "string", minLength: 1 },
                    timestamp: { type: "string", format: "date-time" },
                    segments: { type: "array", items: { type: "object" } },
                  },
                },
              },
            },
          },
          responses: {
            "201": successResponse("transcript created", {
              type: "object",
              properties: {
                id: { type: "string" },
                sessionId: { type: "string" },
              },
            }),
            "400": errorResponse("invalid transcript data"),
          },
        },
      },
      // --- health ---
      "/api/health": {
        get: {
          tags: ["health"],
          summary: "service health check",
          description:
            "checks connectivity to Firebase, Gemini, and ElevenLabs services. no authentication required.",
          operationId: "healthCheck",
          responses: {
            "200": successResponse("all services healthy", {
              type: "object",
              properties: {
                status: { type: "string", example: "healthy" },
                services: {
                  type: "object",
                  properties: {
                    firebase: { type: "string", enum: ["up", "down"] },
                    gemini: { type: "string", enum: ["up", "down"] },
                    elevenlabs: { type: "string", enum: ["up", "down"] },
                  },
                },
                timestamp: { type: "string", format: "date-time" },
              },
            }),
            "503": errorResponse("one or more services unhealthy"),
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth,
      },
    },
  };
}

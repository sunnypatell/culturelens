// OpenAPI 3.1.0 specification for CultureLens API
// auto-serves at /docs/api via Scalar interactive explorer

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
          success: {
            type: "boolean" as const,
            example: false,
            description: "indicates the request failed",
          },
          error: {
            type: "object" as const,
            properties: {
              code: {
                type: "string" as const,
                description: "machine-readable error code",
                example: "VALIDATION_ERROR",
              },
              message: {
                type: "string" as const,
                description: "human-readable error message",
                example: "invalid request parameters",
              },
              details: {
                type: "string" as const,
                description: "additional context about the error",
              },
              hint: {
                type: "string" as const,
                description: "suggestion for resolving the error",
              },
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
          success: {
            type: "boolean" as const,
            example: true,
            description: "indicates the request succeeded",
          },
          data: dataSchema,
          message: {
            type: "string" as const,
            description: "optional success message",
          },
          meta: {
            type: "object" as const,
            description: "optional metadata (pagination, etc.)",
          },
        },
        required: ["success", "data"],
      },
    },
  },
});

export function buildOpenAPISpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: "CultureLens API",
      version: API_VERSION,
      description: `consent-based conversation analytics platform with cultural awareness.

## overview

CultureLens provides real-time voice conversation analysis powered by Google Gemini 2.5 Flash,
ElevenLabs voice synthesis, and Firebase authentication. all endpoints return a consistent
\`{ success, data }\` or \`{ success, error }\` envelope.

## key features

- **consent-first architecture** — every session requires explicit dual-participant consent
- **cultural communication analysis** — AI-powered insights using Google Gemini 2.5 Flash
- **privacy-preserving storage** — ephemeral and transcript-only modes
- **real-time voice synthesis** — ElevenLabs voice agent integration with WebSocket support
- **GDPR compliance** — full data export and account deletion workflows
- **multi-platform** — cross-platform sync between web, iOS, and future mobile apps

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
        name: "Proprietary — © 2026 Sunny Patel. All rights reserved.",
      },
    },
    servers: [
      {
        url: "https://culturelens.vercel.app",
        description: "production",
      },
      {
        url: "http://localhost:3000",
        description: "local development",
      },
    ],
    tags: [
      {
        name: "sessions",
        description:
          "create, manage, and query conversation sessions. sessions are the core entity in CultureLens, representing a single recorded conversation between participants. each session includes consent verification, recording settings, and status tracking.",
      },
      {
        name: "analysis",
        description:
          "trigger and retrieve AI-powered cultural communication analysis. analysis is performed using Google Gemini 2.5 Flash, providing metrics, insights, and personalized debrief content. supports quick, standard, and deep analysis modes.",
      },
      {
        name: "audio",
        description:
          "upload and retrieve session audio recordings. audio files are stored in Firebase Storage with automatic cleanup based on session storage mode. supports WebM format for web and iOS compatibility.",
      },
      {
        name: "elevenlabs",
        description:
          "text-to-speech and voice agent integration. provides ElevenLabs voice synthesis for generating debrief audio and real-time conversational voice agent capabilities via WebSocket connections.",
      },
      {
        name: "user",
        description:
          "user profile, data export, and account management. includes GDPR-compliant data export, profile synchronization between Firebase Auth and Firestore, and complete account deletion with cascade cleanup.",
      },
      {
        name: "auth",
        description:
          "authentication and role management. handles Firebase JWT verification, user identity, and role-based access control. admin endpoints require elevated permissions.",
      },
      {
        name: "settings",
        description:
          "user preferences and application settings. configure notification preferences, theme, cultural analysis parameters, data retention policies, and sensitivity levels for analysis.",
      },
      {
        name: "transcripts",
        description:
          "conversation transcript storage. transcripts include full text, speaker-segmented data, timestamps, and confidence scores. stored separately from audio to support transcript-only storage mode.",
      },
      {
        name: "health",
        description:
          "service health and dependency status. monitors connectivity to Firebase, Gemini, and ElevenLabs services. provides latency metrics and version information for system monitoring.",
      },
    ],
    paths: {
      // --- sessions ---
      "/api/sessions": {
        post: {
          tags: ["sessions"],
          summary: "create a new session",
          description:
            "creates a new conversation session with consent verification and recording settings. requires explicit consent from both participants before session creation. consent is stored with timestamp for audit purposes.",
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
                      $ref: "#/components/schemas/ConsentObject",
                    },
                    settings: {
                      $ref: "#/components/schemas/SessionSettings",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": successResponse("session created successfully", {
              $ref: "#/components/schemas/Session",
            }),
            "400": errorResponse("invalid request body or missing consent"),
            "401": errorResponse("authentication required"),
          },
        },
        get: {
          tags: ["sessions"],
          summary: "list all sessions",
          description:
            "retrieves all sessions for the authenticated user, sorted by most recent first. includes session metadata, status, and settings. does not include analysis results or audio.",
          operationId: "listSessions",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": successResponse("sessions list retrieved successfully", {
              type: "array",
              items: {
                $ref: "#/components/schemas/Session",
              },
            }),
            "401": errorResponse("authentication required"),
          },
        },
      },
      "/api/sessions/{id}": {
        get: {
          tags: ["sessions"],
          summary: "get session by ID",
          description:
            "retrieves detailed information about a specific session by its unique identifier. includes all session metadata, settings, and current status.",
          operationId: "getSession",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "unique session identifier",
              schema: { type: "string" },
              example: "abc123xyz789",
            },
          ],
          responses: {
            "200": successResponse("session details retrieved successfully", {
              $ref: "#/components/schemas/Session",
            }),
            "401": errorResponse("authentication required"),
            "404": errorResponse("session not found"),
          },
        },
        patch: {
          tags: ["sessions"],
          summary: "update session",
          description:
            "partially updates a session's mutable fields such as title or status. only the session owner can update their sessions.",
          operationId: "updateSession",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "unique session identifier",
              schema: { type: "string" },
              example: "abc123xyz789",
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description: "human-readable title for the session",
                      example: "team retrospective discussion",
                    },
                    status: {
                      type: "string",
                      enum: ["active", "completed", "analyzed"],
                      description: "current session lifecycle status",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": successResponse("session updated successfully", {
              $ref: "#/components/schemas/Session",
            }),
            "401": errorResponse("authentication required"),
            "404": errorResponse("session not found"),
          },
        },
        delete: {
          tags: ["sessions"],
          summary: "delete session",
          description:
            "permanently deletes a session and all associated data including audio files, transcripts, and analysis results. this operation cannot be undone.",
          operationId: "deleteSession",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "unique session identifier",
              schema: { type: "string" },
              example: "abc123xyz789",
            },
          ],
          responses: {
            "200": successResponse("session deleted successfully", {
              type: "object",
              properties: {
                deleted: {
                  type: "boolean",
                  description: "confirms deletion completed",
                  example: true,
                },
              },
            }),
            "401": errorResponse("authentication required"),
            "404": errorResponse("session not found"),
          },
        },
      },
      "/api/sessions/{id}/favorite": {
        patch: {
          tags: ["sessions"],
          summary: "toggle session favorite",
          description:
            "toggles the favorite status of a session. favorited sessions can be filtered and sorted separately in the UI.",
          operationId: "toggleFavorite",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "unique session identifier",
              schema: { type: "string" },
              example: "abc123xyz789",
            },
          ],
          responses: {
            "200": successResponse("favorite status toggled successfully", {
              type: "object",
              properties: {
                isFavorite: {
                  type: "boolean",
                  description: "new favorite status",
                  example: true,
                },
              },
            }),
            "401": errorResponse("authentication required"),
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
            "initiates AI-powered cultural communication analysis using Google Gemini 2.5 Flash. analyzes conversation transcript to generate metrics (sentiment, topics, emotional tone), insights (cultural patterns, communication dynamics), and personalized debrief. analysis depth is determined by session settings.",
          operationId: "triggerAnalysis",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "unique session identifier",
              schema: { type: "string" },
              example: "abc123xyz789",
            },
          ],
          responses: {
            "200": successResponse("analysis started successfully", {
              $ref: "#/components/schemas/Analysis",
            }),
            "401": errorResponse("authentication required"),
            "404": errorResponse("session not found"),
            "503": errorResponse("Gemini service unavailable"),
          },
        },
        get: {
          tags: ["analysis"],
          summary: "get analysis results",
          description:
            "retrieves the analysis results for a session. returns metrics, insights, and debrief content. if analysis has not been triggered yet, returns 404.",
          operationId: "getAnalysis",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "unique session identifier",
              schema: { type: "string" },
              example: "abc123xyz789",
            },
          ],
          responses: {
            "200": successResponse("analysis results retrieved successfully", {
              $ref: "#/components/schemas/Analysis",
            }),
            "401": errorResponse("authentication required"),
            "404": errorResponse("analysis not found"),
          },
        },
      },
      // --- audio ---
      "/api/sessions/{id}/upload": {
        post: {
          tags: ["audio"],
          summary: "upload session audio",
          description:
            "uploads audio recording for a session to Firebase Storage. accepts WebM format. audio is stored according to session storage mode (ephemeral or transcript-only). ephemeral mode auto-deletes audio after analysis.",
          operationId: "uploadAudio",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "unique session identifier",
              schema: { type: "string" },
              example: "abc123xyz789",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    audio: {
                      type: "string",
                      format: "binary",
                      description: "audio file in WebM format",
                    },
                  },
                  required: ["audio"],
                },
              },
            },
          },
          responses: {
            "200": successResponse("audio uploaded successfully", {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  format: "uri",
                  description: "Firebase Storage download URL",
                  example:
                    "https://storage.googleapis.com/culturelens/audio/abc123.webm",
                },
              },
            }),
            "400": errorResponse("invalid audio file or format"),
            "401": errorResponse("authentication required"),
          },
        },
      },
      "/api/audio/{id}": {
        get: {
          tags: ["audio"],
          summary: "get audio by ID",
          description:
            "retrieves audio recording for a session. returns audio stream in WebM format. only available if session storage mode allows audio retention.",
          operationId: "getAudio",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "unique audio file identifier",
              schema: { type: "string" },
              example: "abc123xyz789",
            },
          ],
          responses: {
            "200": {
              description: "audio stream retrieved successfully",
              content: {
                "audio/webm": { schema: { type: "string", format: "binary" } },
              },
            },
            "401": errorResponse("authentication required"),
            "404": errorResponse("audio not found or deleted"),
          },
        },
      },
      // --- elevenlabs ---
      "/api/elevenlabs/tts": {
        post: {
          tags: ["elevenlabs"],
          summary: "text-to-speech synthesis",
          description:
            "converts text to speech using ElevenLabs voice synthesis API. used for generating audio debrief narration. supports multiple voice IDs with customizable voice settings.",
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
                      description: "text to synthesize into speech",
                      example:
                        "your conversation showed strong empathy and active listening.",
                    },
                    voiceId: {
                      type: "string",
                      description:
                        "ElevenLabs voice ID (defaults to session voice)",
                      example: "21m00Tcm4TlvDq8ikWAM",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "audio stream generated successfully",
              content: {
                "audio/mpeg": { schema: { type: "string", format: "binary" } },
              },
            },
            "401": errorResponse("authentication required"),
            "503": errorResponse("ElevenLabs service unavailable"),
          },
        },
      },
      "/api/elevenlabs/signed-url": {
        get: {
          tags: ["elevenlabs"],
          summary: "get signed WebSocket URL",
          description:
            "retrieves a signed URL for real-time voice agent WebSocket connection. used for conversational AI features with streaming audio input/output. signed URLs expire after 60 seconds.",
          operationId: "getSignedUrl",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": successResponse(
              "signed WebSocket URL generated successfully",
              {
                type: "object",
                properties: {
                  signedUrl: {
                    type: "string",
                    format: "uri",
                    description:
                      "authenticated WebSocket URL for ElevenLabs voice agent",
                    example:
                      "wss://api.elevenlabs.io/v1/convai/conversation?signed_token=...",
                  },
                },
              }
            ),
            "401": errorResponse("authentication required"),
            "503": errorResponse("ElevenLabs service unavailable"),
          },
        },
      },
      // --- user ---
      "/api/user/profile": {
        patch: {
          tags: ["user"],
          summary: "update user profile",
          description:
            "updates mutable user profile fields in Firebase Auth. changes are synced to Firestore profile document. only display name and photo URL can be updated via this endpoint.",
          operationId: "updateProfile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    displayName: {
                      type: "string",
                      description: "user's display name",
                      example: "Sunny Patel",
                    },
                    photoURL: {
                      type: "string",
                      format: "uri",
                      description: "user's profile photo URL",
                      example: "https://example.com/photo.jpg",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": successResponse("profile updated successfully", {
              $ref: "#/components/schemas/UserProfile",
            }),
            "401": errorResponse("authentication required"),
          },
        },
      },
      "/api/user/sync-profile": {
        post: {
          tags: ["user"],
          summary: "sync user profile to firestore",
          description:
            "synchronizes Firebase Auth user data to Firestore profile collection. creates or updates the profile document with latest auth provider data. used for cross-platform profile consistency.",
          operationId: "syncProfile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                      description: "user's email address",
                      example: "sunny@example.com",
                    },
                    displayName: {
                      type: "string",
                      description: "user's display name",
                      example: "Sunny Patel",
                    },
                    phoneNumber: {
                      type: "string",
                      description: "user's phone number (E.164 format)",
                      example: "+1234567890",
                    },
                    photoURL: {
                      type: "string",
                      format: "uri",
                      description: "user's profile photo URL",
                      example: "https://example.com/photo.jpg",
                    },
                    emailVerified: {
                      type: "boolean",
                      description: "whether email has been verified",
                      example: true,
                    },
                    linkedProviders: {
                      type: "array",
                      items: { type: "string" },
                      description: "authentication providers linked to account",
                      example: ["google.com", "password"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": successResponse("profile synced successfully", {
              type: "object",
              properties: {
                synced: {
                  type: "boolean",
                  description: "confirms sync completed",
                  example: true,
                },
              },
            }),
            "401": errorResponse("authentication required"),
          },
        },
        get: {
          tags: ["user"],
          summary: "get synced profile",
          description:
            "retrieves the Firestore-synced user profile document. includes all profile fields, linked providers, and timestamps.",
          operationId: "getSyncedProfile",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": successResponse("synced profile retrieved successfully", {
              $ref: "#/components/schemas/UserProfile",
            }),
            "401": errorResponse("authentication required"),
          },
        },
      },
      "/api/user/export": {
        post: {
          tags: ["user"],
          summary: "export user data (GDPR)",
          description:
            "exports all user data in a downloadable JSON format for GDPR compliance. includes complete profile information, all sessions with settings and metadata, transcripts, analysis results, and user preferences. audio files are not included but URLs are provided.",
          operationId: "exportUserData",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": successResponse("user data export completed successfully", {
              type: "object",
              properties: {
                profile: {
                  $ref: "#/components/schemas/UserProfile",
                  description: "complete user profile data",
                },
                sessions: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Session",
                  },
                  description:
                    "all sessions with settings, transcripts, and analysis",
                },
                settings: {
                  $ref: "#/components/schemas/Settings",
                  description: "user preferences and settings",
                },
                exportedAt: {
                  type: "string",
                  format: "date-time",
                  description: "timestamp of export generation",
                  example: "2026-01-28T12:00:00.000Z",
                },
                version: {
                  type: "string",
                  description: "export format version",
                  example: "1.0.0",
                },
              },
              required: ["profile", "sessions", "exportedAt", "version"],
            }),
            "401": errorResponse("authentication required"),
          },
        },
      },
      "/api/user/delete": {
        delete: {
          tags: ["user"],
          summary: "delete user account",
          description:
            "permanently deletes the user account and all associated data with cascade cleanup. this operation deletes: (1) all sessions and their associated audio files, transcripts, and analysis results, (2) user profile document from Firestore, (3) user settings and preferences, (4) Firebase Auth account. this operation cannot be undone.",
          operationId: "deleteAccount",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": successResponse(
              "account and all associated data deleted successfully",
              {
                type: "object",
                properties: {
                  deleted: {
                    type: "boolean",
                    description: "confirms deletion completed",
                    example: true,
                  },
                },
              }
            ),
            "401": errorResponse("authentication required"),
          },
        },
      },
      // --- auth ---
      "/api/auth/user": {
        get: {
          tags: ["auth"],
          summary: "get current user",
          description:
            "retrieves the currently authenticated user's information from their Firebase JWT token. includes UID, email, display name, and role.",
          operationId: "getCurrentUser",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": successResponse(
              "current user information retrieved successfully",
              {
                type: "object",
                properties: {
                  uid: {
                    type: "string",
                    description: "unique user identifier",
                    example: "abc123xyz789",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    description: "user's email address",
                    example: "sunny@example.com",
                  },
                  displayName: {
                    type: "string",
                    description: "user's display name",
                    example: "Sunny Patel",
                  },
                  role: {
                    type: "string",
                    description: "user's role in the system",
                    example: "user",
                  },
                },
              }
            ),
            "401": errorResponse("not authenticated"),
          },
        },
      },
      "/api/auth/admin/roles": {
        post: {
          tags: ["auth"],
          summary: "assign user role (admin only)",
          description:
            "assigns a role to a user account. requires admin privileges. used for granting elevated permissions to users for administrative tasks.",
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
                    uid: {
                      type: "string",
                      description: "unique user identifier to assign role to",
                      example: "abc123xyz789",
                    },
                    role: {
                      type: "string",
                      enum: ["user", "admin"],
                      description: "role to assign",
                      example: "admin",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": successResponse("role assigned successfully", {
              type: "object",
              properties: {
                uid: {
                  type: "string",
                  description: "user identifier",
                  example: "abc123xyz789",
                },
                role: {
                  type: "string",
                  description: "newly assigned role",
                  example: "admin",
                },
              },
            }),
            "401": errorResponse("authentication required"),
            "403": errorResponse("admin access required"),
          },
        },
      },
      // --- settings ---
      "/api/settings": {
        get: {
          tags: ["settings"],
          summary: "get user settings",
          description:
            "retrieves all user preferences and application settings. includes notification settings, theme, cultural analysis parameters, data retention policies, and sensitivity levels.",
          operationId: "getSettings",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": successResponse("user settings retrieved successfully", {
              $ref: "#/components/schemas/Settings",
            }),
            "401": errorResponse("authentication required"),
          },
        },
        put: {
          tags: ["settings"],
          summary: "update user settings",
          description:
            "updates user preferences and application settings. all fields are optional. only provided fields will be updated.",
          operationId: "updateSettings",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Settings",
                },
              },
            },
          },
          responses: {
            "200": successResponse("settings updated successfully", {
              $ref: "#/components/schemas/Settings",
            }),
            "401": errorResponse("authentication required"),
          },
        },
      },
      // --- transcripts ---
      "/api/transcripts": {
        post: {
          tags: ["transcripts"],
          summary: "create transcript",
          description:
            "creates a new transcript for a session. transcripts include full conversation text, speaker-segmented data with timestamps, and confidence scores. transcripts are stored separately from audio to support transcript-only storage mode.",
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
                    sessionId: {
                      type: "string",
                      minLength: 1,
                      description:
                        "unique identifier of the session this transcript belongs to",
                      example: "abc123xyz789",
                    },
                    transcript: {
                      type: "string",
                      minLength: 1,
                      description: "full conversation text",
                      example:
                        "Speaker A: Hello, how are you? Speaker B: I'm doing well, thanks!",
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                      description: "when the transcript was generated",
                      example: "2026-01-28T12:00:00.000Z",
                    },
                    segments: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          speaker: {
                            type: "string",
                            description: "speaker identifier",
                            example: "Speaker A",
                          },
                          text: {
                            type: "string",
                            description: "segment text",
                            example: "Hello, how are you?",
                          },
                          startTime: {
                            type: "number",
                            description: "segment start time in seconds",
                            example: 0.5,
                          },
                          endTime: {
                            type: "number",
                            description: "segment end time in seconds",
                            example: 2.3,
                          },
                          confidence: {
                            type: "number",
                            description: "transcription confidence score (0-1)",
                            example: 0.95,
                          },
                        },
                      },
                      description: "speaker-segmented transcript data",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": successResponse("transcript created successfully", {
              $ref: "#/components/schemas/Transcript",
            }),
            "400": errorResponse("invalid transcript data"),
            "401": errorResponse("authentication required"),
          },
        },
      },
      // --- health ---
      "/api/health": {
        get: {
          tags: ["health"],
          summary: "service health check",
          description:
            "checks connectivity to Firebase, Gemini, and ElevenLabs services. returns status for each service with latency metrics. no authentication required. used for monitoring and uptime checks.",
          operationId: "healthCheck",
          responses: {
            "200": successResponse("all services healthy", {
              $ref: "#/components/schemas/HealthStatus",
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
      schemas: {
        // --- core entities ---
        Session: {
          type: "object" as const,
          description:
            "conversation session with consent, settings, and status tracking",
          properties: {
            id: {
              type: "string" as const,
              description: "unique session identifier",
              example: "abc123xyz789",
            },
            title: {
              type: "string" as const,
              description: "human-readable session title",
              example: "cross-cultural communication session",
            },
            status: {
              type: "string" as const,
              enum: ["active", "completed", "analyzed"],
              description: "current session lifecycle status",
              example: "analyzed",
            },
            createdAt: {
              type: "string" as const,
              format: "date-time",
              description: "session creation timestamp",
              example: "2026-01-28T10:00:00.000Z",
            },
            updatedAt: {
              type: "string" as const,
              format: "date-time",
              description: "last modification timestamp",
              example: "2026-01-28T12:30:00.000Z",
            },
            isFavorite: {
              type: "boolean" as const,
              description: "whether session is marked as favorite",
              example: false,
            },
            settings: {
              $ref: "#/components/schemas/SessionSettings",
            },
          },
          required: [
            "id",
            "title",
            "status",
            "createdAt",
            "updatedAt",
            "isFavorite",
            "settings",
          ],
        },
        Analysis: {
          type: "object" as const,
          description:
            "AI-powered cultural communication analysis results from Gemini 2.5 Flash",
          properties: {
            sessionId: {
              type: "string" as const,
              description: "associated session identifier",
              example: "abc123xyz789",
            },
            metrics: {
              type: "object" as const,
              description: "quantitative conversation metrics and statistics",
              properties: {
                sentiment: {
                  type: "object" as const,
                  description: "overall sentiment analysis",
                  properties: {
                    score: {
                      type: "number" as const,
                      description: "sentiment score (-1 to 1)",
                      example: 0.75,
                    },
                    label: {
                      type: "string" as const,
                      enum: ["positive", "neutral", "negative"],
                      description: "sentiment classification",
                      example: "positive",
                    },
                  },
                },
                topics: {
                  type: "array" as const,
                  description: "identified conversation topics",
                  items: {
                    type: "object" as const,
                    properties: {
                      name: {
                        type: "string" as const,
                        description: "topic name",
                        example: "team collaboration",
                      },
                      relevance: {
                        type: "number" as const,
                        description: "topic relevance score (0-1)",
                        example: 0.85,
                      },
                    },
                  },
                  example: [
                    { name: "team collaboration", relevance: 0.85 },
                    { name: "project planning", relevance: 0.72 },
                  ],
                },
                emotionalTone: {
                  type: "object" as const,
                  description: "emotional tone distribution",
                  properties: {
                    joy: {
                      type: "number" as const,
                      description: "joy intensity (0-1)",
                      example: 0.6,
                    },
                    sadness: {
                      type: "number" as const,
                      description: "sadness intensity (0-1)",
                      example: 0.1,
                    },
                    anger: {
                      type: "number" as const,
                      description: "anger intensity (0-1)",
                      example: 0.05,
                    },
                    surprise: {
                      type: "number" as const,
                      description: "surprise intensity (0-1)",
                      example: 0.25,
                    },
                  },
                },
              },
            },
            insights: {
              type: "array" as const,
              description: "cultural and communication pattern insights",
              items: {
                type: "object" as const,
                properties: {
                  category: {
                    type: "string" as const,
                    description: "insight category",
                    example: "cultural awareness",
                  },
                  title: {
                    type: "string" as const,
                    description: "insight title",
                    example: "high-context communication detected",
                  },
                  description: {
                    type: "string" as const,
                    description: "detailed insight explanation",
                    example:
                      "conversation shows indirect communication style common in collectivist cultures",
                  },
                  confidence: {
                    type: "number" as const,
                    description: "insight confidence score (0-1)",
                    example: 0.87,
                  },
                },
              },
            },
            debrief: {
              type: "string" as const,
              description:
                "personalized debrief narrative summarizing the analysis",
              example:
                "your conversation demonstrated strong cultural awareness with balanced turn-taking and active listening...",
            },
            analyzedAt: {
              type: "string" as const,
              format: "date-time",
              description: "when analysis was performed",
              example: "2026-01-28T12:30:00.000Z",
            },
          },
          required: [
            "sessionId",
            "metrics",
            "insights",
            "debrief",
            "analyzedAt",
          ],
        },
        UserProfile: {
          type: "object" as const,
          description: "user profile with authentication and provider data",
          properties: {
            uid: {
              type: "string" as const,
              description: "unique user identifier from Firebase Auth",
              example: "abc123xyz789",
            },
            email: {
              type: "string" as const,
              format: "email",
              description: "primary email address",
              example: "sunny@example.com",
            },
            displayName: {
              type: "string" as const,
              description: "user's display name",
              example: "Sunny Patel",
            },
            photoURL: {
              type: "string" as const,
              format: "uri",
              description: "profile photo URL",
              example: "https://example.com/photo.jpg",
            },
            emailVerified: {
              type: "boolean" as const,
              description: "whether email has been verified",
              example: true,
            },
            phoneNumber: {
              type: "string" as const,
              description: "phone number in E.164 format",
              example: "+1234567890",
            },
            linkedProviders: {
              type: "array" as const,
              items: { type: "string" as const },
              description: "authentication providers linked to this account",
              example: ["google.com", "password"],
            },
            createdAt: {
              type: "string" as const,
              format: "date-time",
              description: "account creation timestamp",
              example: "2026-01-15T08:00:00.000Z",
            },
            updatedAt: {
              type: "string" as const,
              format: "date-time",
              description: "last profile update timestamp",
              example: "2026-01-28T10:00:00.000Z",
            },
          },
          required: [
            "uid",
            "email",
            "emailVerified",
            "linkedProviders",
            "createdAt",
            "updatedAt",
          ],
        },
        Settings: {
          type: "object" as const,
          description: "user preferences and application configuration",
          properties: {
            notifications: {
              type: "boolean" as const,
              description: "enable push notifications",
              example: true,
            },
            autoSave: {
              type: "boolean" as const,
              description: "automatically save session recordings",
              example: true,
            },
            culturalAnalysis: {
              type: "boolean" as const,
              description: "enable cultural analysis features",
              example: true,
            },
            dataRetention: {
              type: "string" as const,
              enum: ["30days", "90days", "1year", "forever"],
              description: "how long to retain session data",
              example: "90days",
            },
            sensitivityLevel: {
              type: "integer" as const,
              minimum: 0,
              maximum: 5,
              description:
                "cultural sensitivity level for analysis (0=minimal, 5=maximum)",
              example: 3,
            },
            theme: {
              type: "string" as const,
              enum: ["light", "dark", "system"],
              description: "UI theme preference",
              example: "system",
            },
            focusAreas: {
              type: "array" as const,
              items: { type: "string" as const },
              description: "cultural focus areas for prioritized analysis",
              example: ["communication style", "conflict resolution"],
            },
          },
          required: [
            "notifications",
            "autoSave",
            "culturalAnalysis",
            "dataRetention",
            "sensitivityLevel",
            "theme",
          ],
        },
        Transcript: {
          type: "object" as const,
          description:
            "conversation transcript with speaker segments and timestamps",
          properties: {
            id: {
              type: "string" as const,
              description: "unique transcript identifier",
              example: "trans123xyz",
            },
            sessionId: {
              type: "string" as const,
              description: "associated session identifier",
              example: "abc123xyz789",
            },
            transcript: {
              type: "string" as const,
              description: "full conversation text",
              example:
                "Speaker A: Hello, how are you? Speaker B: I'm doing well, thanks!",
            },
            timestamp: {
              type: "string" as const,
              format: "date-time",
              description: "when the transcript was generated",
              example: "2026-01-28T12:00:00.000Z",
            },
            segments: {
              type: "array" as const,
              description: "speaker-segmented transcript data",
              items: {
                type: "object" as const,
                properties: {
                  speaker: {
                    type: "string" as const,
                    description: "speaker identifier",
                    example: "Speaker A",
                  },
                  text: {
                    type: "string" as const,
                    description: "segment text",
                    example: "Hello, how are you?",
                  },
                  startTime: {
                    type: "number" as const,
                    description: "segment start time in seconds",
                    example: 0.5,
                  },
                  endTime: {
                    type: "number" as const,
                    description: "segment end time in seconds",
                    example: 2.3,
                  },
                  confidence: {
                    type: "number" as const,
                    description: "transcription confidence score (0-1)",
                    example: 0.95,
                  },
                },
                required: ["speaker", "text", "startTime", "endTime"],
              },
            },
          },
          required: ["id", "sessionId", "transcript", "timestamp"],
        },
        HealthStatus: {
          type: "object" as const,
          description: "system health and service status information",
          properties: {
            status: {
              type: "string" as const,
              enum: ["healthy", "degraded", "unhealthy"],
              description: "overall system health status",
              example: "healthy",
            },
            timestamp: {
              type: "string" as const,
              format: "date-time",
              description: "health check timestamp",
              example: "2026-01-28T12:00:00.000Z",
            },
            version: {
              type: "string" as const,
              description: "API version",
              example: "0.2.0",
            },
            uptime: {
              type: "number" as const,
              description: "server uptime in seconds",
              example: 86400,
            },
            services: {
              type: "object" as const,
              description: "individual service health checks",
              properties: {
                api: {
                  type: "object" as const,
                  properties: {
                    status: {
                      type: "string" as const,
                      enum: ["up", "down"],
                      description: "API service status",
                      example: "up",
                    },
                    latencyMs: {
                      type: "number" as const,
                      description: "API latency in milliseconds",
                      example: 12,
                    },
                  },
                },
                firebase: {
                  type: "object" as const,
                  properties: {
                    status: {
                      type: "string" as const,
                      enum: ["up", "down"],
                      description: "Firebase service status",
                      example: "up",
                    },
                    latencyMs: {
                      type: "number" as const,
                      description: "Firebase latency in milliseconds",
                      example: 45,
                    },
                  },
                },
                gemini: {
                  type: "object" as const,
                  properties: {
                    status: {
                      type: "string" as const,
                      enum: ["up", "down"],
                      description: "Gemini AI service status",
                      example: "up",
                    },
                    latencyMs: {
                      type: "number" as const,
                      description: "Gemini latency in milliseconds",
                      example: 230,
                    },
                  },
                },
                elevenlabs: {
                  type: "object" as const,
                  properties: {
                    status: {
                      type: "string" as const,
                      enum: ["up", "down"],
                      description: "ElevenLabs service status",
                      example: "up",
                    },
                    latencyMs: {
                      type: "number" as const,
                      description: "ElevenLabs latency in milliseconds",
                      example: 180,
                    },
                  },
                },
              },
            },
            environment: {
              type: "string" as const,
              enum: ["production", "development"],
              description: "deployment environment",
              example: "production",
            },
          },
          required: ["status", "timestamp", "version", "services"],
        },
        ConsentObject: {
          type: "object" as const,
          description: "dual-participant consent verification",
          properties: {
            personA: {
              type: "boolean" as const,
              description: "participant A has given consent",
              example: true,
            },
            personB: {
              type: "boolean" as const,
              description: "participant B has given consent",
              example: true,
            },
            timestamp: {
              type: "string" as const,
              format: "date-time",
              description: "when consent was obtained",
              example: "2026-01-28T10:00:00.000Z",
            },
          },
          required: ["personA", "personB"],
        },
        SessionSettings: {
          type: "object" as const,
          description: "session-specific recording and analysis settings",
          properties: {
            storageMode: {
              type: "string" as const,
              enum: ["ephemeral", "transcriptOnly"],
              description:
                "data retention mode (ephemeral=auto-delete audio, transcriptOnly=keep transcript only)",
              example: "transcriptOnly",
            },
            voiceId: {
              type: "string" as const,
              description: "ElevenLabs voice ID for debrief narration",
              example: "21m00Tcm4TlvDq8ikWAM",
            },
            title: {
              type: "string" as const,
              description: "optional session title override",
              example: "team retrospective discussion",
            },
            sessionType: {
              type: "string" as const,
              description: "type of conversation session",
              example: "business meeting",
            },
            participantCount: {
              type: "integer" as const,
              description: "number of participants in the session",
              example: 2,
            },
            analysisMethod: {
              type: "string" as const,
              enum: ["quick", "standard", "deep"],
              description: "analysis processing method",
              example: "standard",
            },
            analysisDepth: {
              type: "string" as const,
              enum: ["quick", "standard", "deep"],
              description:
                "depth of analysis (quick=basic metrics, standard=metrics+insights, deep=full cultural analysis)",
              example: "deep",
            },
            culturalContextTags: {
              type: "array" as const,
              items: { type: "string" as const },
              description: "cultural context tags to guide analysis",
              example: ["east asian", "business context"],
            },
            sensitivityLevel: {
              type: "integer" as const,
              minimum: 0,
              maximum: 5,
              description:
                "cultural sensitivity level for analysis (0=minimal, 5=maximum)",
              example: 3,
            },
          },
          required: ["storageMode", "voiceId"],
        },
        ErrorResponse: {
          type: "object" as const,
          description: "standardized error response",
          properties: {
            success: {
              type: "boolean" as const,
              description: "always false for error responses",
              example: false,
            },
            error: {
              type: "object" as const,
              properties: {
                code: {
                  type: "string" as const,
                  description: "machine-readable error code",
                  example: "VALIDATION_ERROR",
                },
                message: {
                  type: "string" as const,
                  description: "human-readable error message",
                  example: "invalid request parameters",
                },
                details: {
                  type: "string" as const,
                  description: "additional error context",
                  example: "field 'consent.personA' is required",
                },
                hint: {
                  type: "string" as const,
                  description: "suggestion for resolving the error",
                  example: "ensure both participants have given consent",
                },
              },
              required: ["code", "message"],
            },
          },
          required: ["success", "error"],
        },
        SuccessResponse: {
          type: "object" as const,
          description: "standardized success response",
          properties: {
            success: {
              type: "boolean" as const,
              description: "always true for success responses",
              example: true,
            },
            data: {
              type: "object" as const,
              description: "response payload data",
            },
            message: {
              type: "string" as const,
              description: "optional success message",
              example: "operation completed successfully",
            },
            meta: {
              type: "object" as const,
              description: "optional metadata (pagination, etc.)",
              properties: {
                page: {
                  type: "integer" as const,
                  description: "current page number",
                  example: 1,
                },
                totalPages: {
                  type: "integer" as const,
                  description: "total number of pages",
                  example: 5,
                },
                totalItems: {
                  type: "integer" as const,
                  description: "total number of items",
                  example: 42,
                },
              },
            },
          },
          required: ["success", "data"],
        },
      },
    },
  };
}

# Voice Selection Feature

## Overview

CultureLens now includes in-app voice selection! Users can choose from 4 natural-sounding voices without needing to configure anything in the ElevenLabs dashboard.

## How It Works

### Built-in Natural Voices

The app comes pre-configured with 4 high-quality conversational voices (all free on ElevenLabs):

| Voice  | Gender | Description                       | Voice ID             |
| ------ | ------ | --------------------------------- | -------------------- |
| Rachel | Female | Warm, conversational (default) ⭐ | 21m00Tcm4TlvDq8ikWAM |
| Drew   | Male   | Approachable, natural pacing      | pNInz6obpgDQGcFmaJgB |
| Clyde  | Male   | Calm, thoughtful                  | 2EiwWnXFnvU5JabPnv8n |
| Elli   | Female | Energetic, engaging               | MF3mGyEYCl7XYWbV9V6O |

### Default Voice Settings

All voices are automatically configured with optimal settings for natural conversation:

```typescript
{
  stability: 0.5,           // Natural variation (not monotone)
  similarity_boost: 0.75,   // Voice consistency
  style: 0.4,               // Conversational (not dramatic)
  use_speaker_boost: true   // Clear audio
}
```

### User Experience

1. User opens the voice agent section
2. Sees a grid of 4 voice options with descriptions
3. Selects their preferred voice (defaults to Rachel)
4. Clicks "Connect to Agent"
5. Agent uses selected voice with natural settings automatically

## Technical Implementation

### Voice Override

We use the ElevenLabs React SDK's `overrides` parameter to dynamically set the voice:

```typescript
await conversation.startSession({
  agentId: AGENT_ID,
  connectionType: "websocket",
  overrides: {
    tts: {
      voiceId: selectedVoice,
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.4,
      use_speaker_boost: true,
    },
  },
});
```

### Component Structure

The `VoiceAgent` component now includes:

- `VOICES` array with pre-configured natural voices
- `selectedVoice` state (defaults to Rachel)
- Voice selection UI (grid of buttons)
- Automatic settings override on connection

## Why This Matters

### Before

- Users had to manually configure voice in ElevenLabs dashboard
- Default voice often sounded robotic
- Required technical knowledge to change settings
- No in-app customization

### After

- ✅ One-click voice selection in the app
- ✅ All voices pre-configured for natural sound
- ✅ No dashboard configuration needed
- ✅ Better user experience

## Free Tier Compatibility

All 4 voices are available on ElevenLabs free tier:

- **Free Credits**: 10,000 characters/month (~3-4 minutes of audio)
- **Startup Grant**: Apply for 33M free credits (worth $4,000+)
- **Pricing**: After free tier, ~10 cents per minute

## Adding More Voices

To add more voices, update the `VOICES` array in [voice-agent.tsx](../components/voice-agent.tsx):

```typescript
const VOICES = [
  {
    id: "voice_id_here", // Get from ElevenLabs dashboard
    name: "Voice Name",
    gender: "Male/Female",
    description: "Short description",
  },
  // ... more voices
];
```

## Sources

- [ElevenLabs React SDK Documentation](https://elevenlabs.io/docs/agents-platform/libraries/react)
- [ElevenLabs Conversational AI Overview](https://elevenlabs.io/docs/conversational-ai/overview)
- [ElevenLabs Voice Library](https://elevenlabs.io/text-to-speech)
- [ElevenLabs Pricing](https://elevenlabs.io/blog/we-cut-our-pricing-for-conversational-ai)

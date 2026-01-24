# ElevenLabs Agent Setup Guide

## Updating Your Agent to Sound More Natural

### Step 1: Access Your ElevenLabs Dashboard

1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Navigate to **Conversational AI** → **Agents**
3. Find your agent (ID: `agent_5401kfq4a552e61962kx44qcbcrn`)
4. Click **Edit Agent**

### Step 2: Update System Prompt

1. In the agent editor, find the **System Prompt** section
2. Delete the current prompt
3. Copy the entire prompt from [`/AGENT_PROMPT.md`](../AGENT_PROMPT.md)
4. Paste it into the System Prompt field

### Step 3: Adjust Voice Settings

While you're in the agent settings, update these:

**Voice Settings:**

- **Stability**: 0.5-0.6 (allows natural variation in speech)
- **Similarity**: 0.7-0.8 (keeps voice consistent)
- **Style Exaggeration**: 0.4-0.5 (conversational, not dramatic)
- **Speaker Boost**: ✅ Enabled

**Conversation Settings:**

- **Mode**: Conversational (not formal/professional)
- **Response Length**: Medium (60-90 seconds)
- **Enable Interruptions**: Yes (more natural flow)

### Step 4: Test the Changes

1. Save your agent
2. In your local CultureLens app, go to the voice agent section
3. Click "Connect to Agent"
4. Have a test conversation
5. Listen for:
   - Natural filler words (um, you know, like)
   - No disclaimers about "can't give advice"
   - Neutral observations vs prescriptive advice
   - Conversational tone vs robotic analysis

### What You Should Hear

**Before (Robotic):**

> "I cannot provide relationship advice as I am not a therapist. However, I have identified several communication patterns in your conversation. Person A interrupted Person B five times during the discussion."

**After (Natural):**

> "Mm, so listening to that... I noticed something about the pacing. When you brought up the weekend plans, the response came really quick - like, almost before you finished your sentence. And that happened a few times around certain topics. Did that feel different to you than the slower back-and-forth about work stuff?"

## Key Improvements

✅ **Natural Speech Patterns**

- Occasional "um", "like", "you know"
- Varied sentence structure
- Contractions (I'm, you're, that's)

✅ **No Disclaimers**

- Won't say "I can't give relationship advice"
- Won't redirect to therapy
- Just analyzes naturally

✅ **Neutral Observations**

- Focuses on patterns, not judgments
- No picking sides
- Describes what happened vs prescribing solutions

✅ **Cultural Awareness**

- Mentions communication styles without stereotyping
- Uses "some styles do X" instead of "you are X"
- Invites reflection vs asserting truth

## Troubleshooting

**Agent still sounds robotic:**

- Make sure you copied the ENTIRE prompt (it's long!)
- Check that voice settings match recommendations above
- Try regenerating the response if it sounds off

**Agent giving disclaimers:**

- Double-check the system prompt was fully replaced
- Old prompts might have cached - disconnect and reconnect

**Agent not using filler words:**

- Adjust Stability setting lower (0.4-0.5)
- Enable "Natural Speech" if available in settings

## Need Help?

Check the main agent prompt file for detailed examples and guidelines: [`/AGENT_PROMPT.md`](../AGENT_PROMPT.md)

# ⚡ Quick Voice Setup Guide - Make Agent Sound Natural

## ❌ The Problem

Your agent sounds robotic because it's using the default voice with default settings.

---

## ✅ The Fix (2 Minutes)

### Step 1: Open Your Agent Settings

1. Go to [elevenlabs.io/app/conversational-ai](https://elevenlabs.io/app/conversational-ai)
2. Find your agent: `agent_5401kfq4a552e61962kx44qcbcrn`
3. Click **Edit Agent**

### Step 2: Change the Voice (Most Important!)

In the agent settings, find **Voice** section:

**Best FREE Natural Voices:**

| #   | Voice         | Gender                 | Notes                                                            | Tier |
| --- | ------------- | ---------------------- | ---------------------------------------------------------------- | ---- |
| 1   | **Rachel** ⭐ | Female, Conversational | Sounds very natural and friendly. Great for casual conversation. | Free |
| 2   | **Drew**      | Male, Conversational   | Warm and approachable. Natural pacing.                           | Free |
| 3   | **Clyde**     | Male, Warm             | Calm and thoughtful. Good for analysis.                          | Free |

**Select one of these voices** instead of whatever is currently selected.

### Step 3: Adjust Voice Settings

Under **Voice Settings**, set these values:

```
Stability: 0.5 (natural variation, not monotone)
Similarity: 0.75 (keeps voice consistent)
Style: 0.4 (conversational, not dramatic)
Use speaker boost: ON
```

### Step 4: Adjust Conversation Settings

Under **Conversation Settings**:

```
Response style: Conversational (NOT Formal)
Response length: Medium
Enable interruptions: ON
Turn detection: Sensitivity - Medium
```

### Step 5: Save and Test

1. Click **Save Agent** (top right)
2. Go to your CultureLens app
3. Click "Connect to Agent"
4. Test it - it should sound MUCH more natural now

---

## 🔀 Before vs After

| Aspect     | Before (Default settings)         | After (Rachel + these settings)      |
| ---------- | --------------------------------- | ------------------------------------ |
| **Tone**   | Monotone, robotic speech          | Natural conversational tone          |
| **Pacing** | No variation in pacing            | Varied pacing and emphasis           |
| **Feel**   | Sounds like reading from a script | Sounds like talking to a real person |

---

## 🔧 Still Sounds Robotic?

1. **Make sure you saved the agent** - changes don't apply until you click Save
2. **Disconnect and reconnect** - old settings might be cached
3. **Try a different voice** - Rachel and Drew are usually the most natural
4. **Lower stability more** - try 0.4 instead of 0.5 for even more variation

---

## 💡 Pro Tip

If you want it to sound REALLY natural:

- Use Rachel voice
- Stability: 0.4-0.5
- Style: 0.3-0.4
- Enable the system prompt from `AGENT_PROMPT.md` (adds "um", "like", natural pauses)

Together, these make the agent sound incredibly human.

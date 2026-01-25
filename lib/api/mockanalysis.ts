export type MockInsight = {
  title: string;
  summary: string;
  evidence: string[];
  whyItMatters: string;
  suggestion: string;
};

export const MOCK_TRANSCRIPT = `Alex:
Jordan, this is unacceptable. The client escalated this to senior management. Do you realize how bad this makes the team look?

Jordan:
No, what’s unacceptable is acting like I deliberately dropped the ball. I told you I didn’t have the data.

Alex:
You sent a vague email and then went silent. That’s not communication—that’s covering yourself.

Jordan:
That’s not fair at all. I followed the process we’ve always used. If you wanted hourly updates, you should’ve said so.

Alex:
I shouldn’t have to micromanage just to get basic accountability.

Jordan:
And I shouldn’t be blamed for problems I don’t control! You’re acting like I’m incompetent instead of acknowledging the system failed.

Alex:
Because from where I’m sitting, you failed to manage your responsibilities.

Jordan:
Wow. So now it’s personal? After all the extra hours I’ve put in?

(Voices rise. Tension is visible. People nearby are listening.)

Alex:
This isn’t about effort—it’s about results. And right now, your results cost us credibility.

Jordan:
And your leadership style makes it impossible to raise issues without getting blamed.
`;

export const MOCK_KEY_INSIGHTS: MockInsight[] = [
  {
    title: "Attribution clash: intent vs. impact",
    summary:
      "Alex frames the issue as Jordan’s personal failure, while Jordan frames it as a systems/data dependency problem—so they argue about blame instead of solving the gap.",
    evidence: [
      "Alex: “you failed to manage your responsibilities.”",
      "Jordan: “I told you I didn’t have the data.”",
      "Jordan: “acknowledging the system failed.”",
    ],
    whyItMatters:
      "When one person hears character judgment and the other hears process breakdown, trust drops fast and the conversation escalates.",
    suggestion:
      "Separate accountability (what happened) from attribution (why it happened). Agree on the missing inputs + a clear escalation path next time."
  },
  {
    title: "Escalation trigger: language that implies character flaws",
    summary:
      "Several phrases imply incompetence or bad faith, which pushes Jordan into defense and raises the emotional temperature.",
    evidence: [
      "Alex: “That’s not communication—that’s covering yourself.”",
      "Alex: “I shouldn’t have to micromanage…”",
      "Jordan: “You’re acting like I’m incompetent…”",
    ],
    whyItMatters:
      "Once the conversation becomes about identity/competence, it becomes much harder to negotiate concrete next steps.",
    suggestion:
      "Swap accusatory labels for observable facts: what was expected, what was received, when, and what the impact was."
  },
  {
    title: "Expectation mismatch: update cadence and ownership were unclear",
    summary:
      "Jordan believes they followed the usual process; Alex expected proactive, frequent updates—neither expectation was made explicit until after escalation.",
    evidence: [
      "Jordan: “I followed the process we’ve always used.”",
      "Jordan: “If you wanted hourly updates, you should’ve said so.”",
      "Alex: “vague email and then went silent.”",
    ],
    whyItMatters:
      "Unspoken expectations create ‘gotcha’ moments: one person feels blindsided, the other feels unfairly attacked.",
    suggestion:
      "Agree on a simple comms contract for high-risk clients: update frequency, what counts as a blocker, and who to notify."
  },
];

// Optional: a mutable store if you later want to set these dynamically.
let mockSessionTitle = "Mock Session: Alex & Jordan Conflict";

export function getMockSessionTitle() {
  return mockSessionTitle;
}

export function setMockSessionTitle(title: string) {
  mockSessionTitle = title;
}

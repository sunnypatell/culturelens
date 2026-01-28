import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSave = vi.fn();
const mockInstance = {
  text: vi.fn(),
  setFontSize: vi.fn(),
  setFont: vi.fn(),
  setTextColor: vi.fn(),
  setFillColor: vi.fn(),
  rect: vi.fn(),
  circle: vi.fn(),
  addPage: vi.fn(),
  setPage: vi.fn(),
  getNumberOfPages: vi.fn(() => 1),
  splitTextToSize: vi.fn((text: string) => [text]),
  save: mockSave,
  lastAutoTable: { finalY: 80 },
};

vi.mock("jspdf", () => ({
  jsPDF: class {
    text = mockInstance.text;
    setFontSize = mockInstance.setFontSize;
    setFont = mockInstance.setFont;
    setTextColor = mockInstance.setTextColor;
    setFillColor = mockInstance.setFillColor;
    rect = mockInstance.rect;
    circle = mockInstance.circle;
    addPage = mockInstance.addPage;
    setPage = mockInstance.setPage;
    getNumberOfPages = mockInstance.getNumberOfPages;
    splitTextToSize = mockInstance.splitTextToSize;
    save = mockInstance.save;
    lastAutoTable = mockInstance.lastAutoTable;
  },
}));

vi.mock("jspdf-autotable", () => ({
  default: vi.fn(),
}));

describe("pdf-export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInstance.getNumberOfPages.mockReturnValue(1);
  });

  it("generates a PDF and triggers download", async () => {
    const { generateAnalysisPDF } = await import("@/lib/pdf-export");

    generateAnalysisPDF({
      sessionId: "test-session-123",
      timestamp: Date.now(),
      transcript: "[A] Hello\n[B] Hi there",
      mediatorInputs: ["Speaker A showed active listening"],
      insights: {
        summary: "A productive conversation.",
        keyPoints: ["Discussed project goals"],
        culturalObservations: ["Direct communication style"],
        communicationPatterns: ["Turn-taking was balanced"],
        recommendations: ["Continue active listening"],
      },
    });

    expect(mockSave).toHaveBeenCalledTimes(1);
    const filename = mockSave.mock.calls[0][0] as string;
    expect(filename).toMatch(/^culturelens-report-test-ses/);
    expect(filename).toMatch(/\.pdf$/);
  });

  it("handles missing insights gracefully", async () => {
    const { generateAnalysisPDF } = await import("@/lib/pdf-export");

    generateAnalysisPDF({
      sessionId: "no-insights-456",
      timestamp: Date.now(),
      transcript: "[A] Test",
      mediatorInputs: [],
    });

    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it("handles empty insights arrays", async () => {
    const { generateAnalysisPDF } = await import("@/lib/pdf-export");

    generateAnalysisPDF({
      sessionId: "empty-insights-789",
      timestamp: Date.now(),
      transcript: "[A] Test",
      mediatorInputs: [],
      insights: {
        summary: "",
        keyPoints: [],
        culturalObservations: [],
        communicationPatterns: [],
        recommendations: [],
      },
    });

    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it("includes session ID prefix and date in filename", async () => {
    const { generateAnalysisPDF } = await import("@/lib/pdf-export");
    const today = new Date().toISOString().slice(0, 10);

    generateAnalysisPDF({
      sessionId: "abcdefgh-1234-5678",
      timestamp: Date.now(),
      transcript: "test",
      mediatorInputs: [],
    });

    const filename = mockSave.mock.calls[0][0] as string;
    expect(filename).toContain("abcdefgh");
    expect(filename).toContain(today);
  });
});

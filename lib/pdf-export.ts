import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportInsights {
  summary: string;
  keyPoints: string[];
  culturalObservations: string[];
  communicationPatterns: string[];
  recommendations: string[];
}

interface ExportData {
  sessionId: string;
  timestamp: number;
  transcript: string;
  mediatorInputs: string[];
  insights?: ExportInsights;
}

// brand colors
const BRAND = {
  primary: [99, 102, 241] as [number, number, number], // indigo-500
  dark: [30, 27, 75] as [number, number, number], // indigo-950
  muted: [100, 116, 139] as [number, number, number], // slate-500
  light: [241, 245, 249] as [number, number, number], // slate-100
  white: [255, 255, 255] as [number, number, number],
  accent: [168, 85, 247] as [number, number, number], // purple-500
};

function addHeader(doc: jsPDF, y: number): number {
  // title bar
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, 210, 40, "F");

  doc.setTextColor(...BRAND.white);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("CultureLens", 20, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Conversation Analysis Report", 20, 32);

  return y + 40;
}

function addSectionHeading(
  doc: jsPDF,
  text: string,
  y: number
): number {
  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(...BRAND.primary);
  doc.rect(20, y, 3, 8, "F");

  doc.setTextColor(...BRAND.dark);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(text, 27, y + 7);

  return y + 16;
}

function addParagraph(doc: jsPDF, text: string, y: number): number {
  doc.setTextColor(...BRAND.muted);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(text, 165);
  const lineHeight = 5;

  for (const line of lines) {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 25, y);
    y += lineHeight;
  }
  return y + 4;
}

function addBulletList(
  doc: jsPDF,
  items: string[],
  y: number
): number {
  doc.setTextColor(...BRAND.muted);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  for (const item of items) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(...BRAND.primary);
    doc.circle(28, y - 1.2, 1.2, "F");

    const lines = doc.splitTextToSize(item, 155);
    for (let i = 0; i < lines.length; i++) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines[i], 33, y);
      y += 5;
    }
    y += 2;
  }

  return y + 2;
}

export function generateAnalysisPDF(data: ExportData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let y = 0;

  // header
  y = addHeader(doc, y);
  y += 8;

  // session metadata table
  autoTable(doc, {
    startY: y,
    margin: { left: 20, right: 20 },
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: {
        fontStyle: "bold",
        textColor: BRAND.dark,
        cellWidth: 40,
      },
      1: { textColor: BRAND.muted },
    },
    body: [
      ["Session ID", data.sessionId],
      ["Date", new Date(data.timestamp).toLocaleString()],
      ["Status", "Complete"],
      ["Generated", new Date().toLocaleString()],
    ],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  // insights
  if (data.insights) {
    if (data.insights.summary) {
      y = addSectionHeading(doc, "Summary", y);
      y = addParagraph(doc, data.insights.summary, y);
    }

    if (data.insights.keyPoints.length > 0) {
      y = addSectionHeading(doc, "Key Points", y);
      y = addBulletList(doc, data.insights.keyPoints, y);
    }

    if (data.insights.culturalObservations.length > 0) {
      y = addSectionHeading(doc, "Cultural Observations", y);
      y = addBulletList(doc, data.insights.culturalObservations, y);
    }

    if (data.insights.communicationPatterns.length > 0) {
      y = addSectionHeading(doc, "Communication Patterns", y);
      y = addBulletList(doc, data.insights.communicationPatterns, y);
    }

    if (data.insights.recommendations.length > 0) {
      y = addSectionHeading(doc, "Recommendations", y);
      y = addBulletList(doc, data.insights.recommendations, y);
    }
  }

  // mediator observations
  if (data.mediatorInputs.length > 0) {
    y = addSectionHeading(doc, "AI Mediator Observations", y);
    y = addBulletList(doc, data.mediatorInputs, y);
  }

  // transcript
  y = addSectionHeading(doc, "Conversation Transcript", y);
  doc.setTextColor(...BRAND.muted);
  doc.setFontSize(8);
  doc.setFont("courier", "normal");

  const transcriptLines = doc.splitTextToSize(data.transcript, 165);
  for (const line of transcriptLines) {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 25, y);
    y += 4;
  }

  // footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text(
      `CultureLens Report — Page ${i} of ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }

  // download
  const filename = `culturelens-report-${data.sessionId.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

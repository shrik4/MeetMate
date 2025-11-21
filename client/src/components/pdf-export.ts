import jsPDF from 'jspdf';
import type { MeetingAnalysis } from '@shared/schema';

export function generatePDF(analysis: MeetingAnalysis) {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const maxWidth = 170;

  const addText = (text: string, size = 12, bold = false) => {
    pdf.setFontSize(size);
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, margin, yPosition);
    yPosition += size / 2.5 * lines.length + 5;
    if (yPosition > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Title
  addText('MEETING INTELLIGENCE REPORT', 18, true);
  addText(`Generated: ${new Date().toLocaleDateString()}`, 10);

  yPosition += 10;
  addText('SUMMARY', 14, true);
  addText(analysis.summary, 11);

  yPosition += 10;
  addText('KEY DECISIONS', 14, true);
  if (analysis.decisions && analysis.decisions.length > 0) {
    analysis.decisions.forEach((d) => addText(`• ${d}`, 10));
  }

  yPosition += 10;
  addText('ACTION ITEMS', 14, true);
  if (analysis.actionItems && analysis.actionItems.length > 0) {
    analysis.actionItems.forEach((item) => {
      addText(`• ${item.task}`, 10, true);
      addText(`  Owner: ${item.owner} | Deadline: ${item.deadline} | Priority: ${item.priority}`, 9);
    });
  }

  yPosition += 10;
  addText('BLOCKERS', 14, true);
  if (analysis.blockers && analysis.blockers.length > 0) {
    analysis.blockers.forEach((b) => addText(`• ${b}`, 10));
  }

  // Save PDF
  pdf.save(`meeting-report-${new Date().getTime()}.pdf`);
}

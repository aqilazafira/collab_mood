import jsPDF from "jspdf"

export function downloadSessionReport(report: any) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text("Session Report", 14, 18)

  doc.setFontSize(12)
  doc.text(`Session ID: ${report.sessionId || "-"}` , 14, 30)
  doc.text(`Summary: ${report.summary || "-"}` , 14, 40)
  doc.text("Emotions:", 14, 50)

  let y = 58
  if (report.insights?.emotions?.length) {
    report.insights.emotions.forEach((e: any, idx: number) => {
      doc.text(
        `- ${e.timestamp ? new Date(e.timestamp).toLocaleString() : ""} | Valence: ${e.valence} | Arousal: ${e.arousal}`,
        16,
        y
      )
      y += 8
    })
  } else {
    doc.text("- No emotion data", 16, y)
    y += 8
  }

  doc.text("Suggestions:", 14, y + 4)
  y += 12
  if (report.insights?.suggestions?.length) {
    report.insights.suggestions.forEach((s: any, idx: number) => {
      doc.text(
        `- ${s.content} [${s.isCompleted ? "Completed" : "Pending"}]`,
        16,
        y
      )
      y += 8
    })
  } else {
    doc.text("- No suggestions", 16, y)
    y += 8
  }

  doc.save(`session-report-${report.sessionId || "unknown"}.pdf`)
}

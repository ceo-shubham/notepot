/**
 * NotePot High-Resolution Multi-Page PDF Exporter
 * Generates crisp A4 PDF with exact ruled lines, handwritten fonts, and ink styling
 */

export async function exportDocumentToPdf(documentData, onProgress) {
  if (typeof window.jspdf === "undefined" || typeof window.html2canvas === "undefined") {
    throw new Error("PDF generation libraries are loading, please try again in a moment.");
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true
  });

  const pageElements = document.querySelectorAll(".notepot-page-sheet");
  const totalPages = pageElements.length;

  if (totalPages === 0) {
    throw new Error("No pages available to export.");
  }

  for (let i = 0; i < totalPages; i++) {
    const pageEl = pageElements[i];

    if (onProgress) {
      onProgress({
        currentPage: i + 1,
        totalPages,
        percent: Math.round(((i + 1) / totalPages) * 100)
      });
    }

    // Capture the page sheet using html2canvas with high DPI
    const canvas = await window.html2canvas(pageEl, {
      scale: 2, // 2x scale for sharp, crisp handwriting
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      windowWidth: pageEl.scrollWidth,
      windowHeight: pageEl.scrollHeight
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    if (i > 0) {
      pdf.addPage("a4", "portrait");
    }

    // A4 dimensions in mm: 210 x 297
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
  }

  const sanitizedTitle = (documentData.title || "NotePot_Assignment")
    .replace(/[^a-zA-Z0-9_\-\u0900-\u097F]/g, "_")
    .substring(0, 50);

  const fileName = `${sanitizedTitle}.pdf`;
  pdf.save(fileName);

  // Return base64 or blob for Backblaze B2 backup
  const pdfBlob = pdf.output("blob");
  return { fileName, pdfBlob };
}

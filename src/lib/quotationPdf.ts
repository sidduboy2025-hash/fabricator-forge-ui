import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { QuotationRecord } from "@/types/quotation";

const currency = (amount: number) => `Rs ${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const downloadQuotationPdf = (quotation: QuotationRecord) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const hasAnyGst = quotation.gstAmount > 0 && quotation.gstPercentage > 0;
  const horizontalPadding = 44;

  doc.setFillColor(12, 48, 84);
  doc.rect(0, 0, pageWidth, 92, "F");

  doc.setFillColor(242, 247, 252);
  doc.rect(0, 92, pageWidth, 30, "F");

  if (quotation.company.logoDataUrl) {
    try {
      doc.addImage(quotation.company.logoDataUrl, "PNG", horizontalPadding, 20, 50, 50, undefined, "FAST");
    } catch {
      try {
        doc.addImage(quotation.company.logoDataUrl, "JPEG", horizontalPadding, 20, 50, 50, undefined, "FAST");
      } catch {
        // Ignore invalid image payload.
      }
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(quotation.company.name || "Company", 104, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Aluminium and Glass Systems", 104, 60);
  doc.text("Professional Quotation", 104, 75);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("QUOTATION", pageWidth - horizontalPadding, 50, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Quote ID: ${quotation.id}`, pageWidth - horizontalPadding, 68, { align: "right" });

  doc.setTextColor(62, 78, 94);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Prepared for", horizontalPadding, 112);
  doc.text("Issue details", pageWidth - horizontalPadding - 130, 112);

  doc.setTextColor(22, 30, 38);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(quotation.client || "Client", horizontalPadding, 130);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Date: ${quotation.date}`, pageWidth - horizontalPadding - 130, 130);
  doc.text(`Valid Until: ${quotation.validUntil}`, pageWidth - horizontalPadding - 130, 146);

  doc.setDrawColor(212, 223, 234);
  doc.line(horizontalPadding, 160, pageWidth - horizontalPadding, 160);

  doc.setTextColor(41, 41, 41);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Itemized Pricing", horizontalPadding, 184);

  if (hasAnyGst) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`GST Rate: ${quotation.gstPercentage}%`, pageWidth - horizontalPadding, 184, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Current GST Amount: ${currency(quotation.gstAmount)}`, pageWidth - horizontalPadding, 198, { align: "right" });
  }

  autoTable(doc, {
    startY: 206,
    head: [["Item", "Description", "Qty", "Unit Price", "Line Total", "GST"]],
    body: quotation.lineItems.map((item) => [
      item.isMandatoryGst ? `${item.label} (Mandatory GST)` : item.label,
      item.isMandatoryGst ? "Mandatory GST product" : "Standard product",
      item.quantity.toString(),
      currency(item.unitPrice),
      currency(item.totalPrice),
      item.gstApplied ? `${currency(item.gstAmount)} @ ${quotation.gstPercentage}%` : "-",
    ]),
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 6,
      textColor: [35, 35, 35],
      lineColor: [226, 233, 240],
      lineWidth: 0.6,
    },
    headStyles: {
      fillColor: [18, 73, 126],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: [248, 251, 254],
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 110 },
      2: { halign: "right", cellWidth: 35 },
      3: { halign: "right", cellWidth: 75 },
      4: { halign: "right", cellWidth: 75 },
      5: { halign: "right", cellWidth: 75 },
    },
    margin: { left: horizontalPadding, right: horizontalPadding },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 340;
  const summaryTop = finalY + 24;
  const summaryWidth = 250;
  const summaryHeight = hasAnyGst ? 112 : 86;
  const summaryLeft = pageWidth - horizontalPadding - summaryWidth;

  doc.setFillColor(247, 250, 253);
  doc.roundedRect(summaryLeft, summaryTop, summaryWidth, summaryHeight, 8, 8, "F");
  doc.setDrawColor(213, 224, 236);
  doc.roundedRect(summaryLeft, summaryTop, summaryWidth, summaryHeight, 8, 8, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(41, 57, 73);
  doc.text("Subtotal", summaryLeft + 16, summaryTop + 24);
  doc.text(currency(quotation.amount), summaryLeft + summaryWidth - 16, summaryTop + 24, { align: "right" });

  if (hasAnyGst) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`GST @ ${quotation.gstPercentage}%`, summaryLeft + 16, summaryTop + 48);
    doc.text(currency(quotation.gstAmount), summaryLeft + summaryWidth - 16, summaryTop + 48, { align: "right" });

    doc.setDrawColor(220, 228, 236);
    doc.line(summaryLeft + 12, summaryTop + 62, summaryLeft + summaryWidth - 12, summaryTop + 62);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Grand Total", summaryLeft + 16, summaryTop + 84);
    doc.setFontSize(16);
    doc.text(currency(quotation.totalAmount), summaryLeft + summaryWidth - 16, summaryTop + 84, { align: "right" });
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Grand Total", summaryLeft + 16, summaryTop + 56);
    doc.setFontSize(16);
    doc.text(currency(quotation.totalAmount), summaryLeft + summaryWidth - 16, summaryTop + 56, { align: "right" });
  }

  const notesTop = summaryTop + summaryHeight + 20;
  const notesWidth = pageWidth - (horizontalPadding * 2);
  const noteLine1 = doc.splitTextToSize("1. Rates are valid up to the validity date shown above.", notesWidth);
  const noteLine2 = doc.splitTextToSize("2. Final quantities and execution details will be confirmed before production.", notesWidth);
  const noteLine3 = doc.splitTextToSize("3. This quotation is generated from the latest configured price profile.", notesWidth);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(73, 86, 99);
  doc.text("Notes", horizontalPadding, notesTop);
  doc.text(noteLine1, horizontalPadding, notesTop + 16);
  doc.text(noteLine2, horizontalPadding, notesTop + 30);
  doc.text(noteLine3, horizontalPadding, notesTop + 44);

  doc.setDrawColor(224, 232, 240);
  doc.line(horizontalPadding, pageHeight - 54, pageWidth - horizontalPadding, pageHeight - 54);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(96, 110, 124);
  doc.text("Thank you for the opportunity to quote. We look forward to working with you.", horizontalPadding, pageHeight - 36);
  doc.text("This is a system-generated quotation document.", pageWidth - horizontalPadding, pageHeight - 36, { align: "right" });

  doc.save(`${quotation.id}.pdf`);
};
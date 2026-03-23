import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { QuotationRecord } from "@/types/quotation";

const currency = (amount: number) => `Rs ${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const downloadQuotationPdf = (quotation: QuotationRecord) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(18, 73, 126);
  doc.rect(0, 0, pageWidth, 110, "F");

  if (quotation.company.logoDataUrl) {
    try {
      doc.addImage(quotation.company.logoDataUrl, "PNG", 42, 24, 58, 58, undefined, "FAST");
    } catch {
      try {
        doc.addImage(quotation.company.logoDataUrl, "JPEG", 42, 24, 58, 58, undefined, "FAST");
      } catch {
        // Ignore invalid image payload.
      }
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.text(quotation.company.name || "Company", 112, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Professional Quotation", 112, 74);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("QUOTATION", pageWidth - 170, 58);

  doc.setTextColor(41, 41, 41);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Quotation Details", 42, 146);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Quote ID: ${quotation.id}`, 42, 166);
  doc.text(`Client: ${quotation.client}`, 42, 182);
  doc.text(`Date: ${quotation.date}`, 42, 198);
  doc.text(`Valid Until: ${quotation.validUntil}`, 42, 214);

  autoTable(doc, {
    startY: 236,
    head: [["Item", "Category", "Qty", "Unit Price", "Line Total"]],
    body: quotation.lineItems.map((item) => [
      item.label,
      item.category,
      item.quantity.toString(),
      currency(item.unitPrice),
      currency(item.totalPrice),
    ]),
    styles: {
      fontSize: 10,
      cellPadding: 7,
      textColor: [35, 35, 35],
    },
    headStyles: {
      fillColor: [18, 73, 126],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [246, 249, 252],
    },
    columnStyles: {
      0: { cellWidth: 215 },
      1: { cellWidth: 85 },
      2: { halign: "right", cellWidth: 50 },
      3: { halign: "right", cellWidth: 95 },
      4: { halign: "right", cellWidth: 95 },
    },
    margin: { left: 42, right: 42 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 320;

  doc.setDrawColor(210, 210, 210);
  doc.line(42, finalY + 20, pageWidth - 42, finalY + 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total", pageWidth - 170, finalY + 44, { align: "right" });
  doc.setFontSize(16);
  doc.text(currency(quotation.amount), pageWidth - 42, finalY + 46, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("This is a system generated quotation. Prices can change based on project updates.", 42, 805);

  doc.save(`${quotation.id}.pdf`);
};

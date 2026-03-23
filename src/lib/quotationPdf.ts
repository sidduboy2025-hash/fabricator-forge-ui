import jsPDF from "jspdf";
import autoTable, { CellHookData } from "jspdf-autotable";
import { QuotationRecord } from "@/types/quotation";

const currency = (amount: number) => `Rs ${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const drawWindowDesign = (
  doc: jsPDF,
  widthMm: number,
  heightMm: number,
  numTracks: number,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  doc.setDrawColor(110, 127, 165);
  doc.setFillColor(247, 250, 255);
  doc.roundedRect(x, y, width, height, 2, 2, "FD");

  const padding = 7;
  const frameX = x + padding;
  const frameY = y + padding + 8;
  const frameW = width - padding * 2;
  const frameH = height - padding * 2 - 16;

  doc.setLineWidth(1.1);
  doc.setDrawColor(49, 88, 186);
  doc.rect(frameX, frameY, frameW, frameH);

  const sashCount = numTracks >= 3 ? 3 : 2;
  const sashWidth = frameW / sashCount;

  for (let index = 0; index < sashCount; index += 1) {
    const sashX = frameX + index * sashWidth;
    const isMesh = (numTracks === 2.5 || numTracks === 3.5) && index === sashCount - 1;
    doc.setFillColor(isMesh ? 226 : 214, isMesh ? 242 : 232, isMesh ? 234 : 252);
    doc.rect(sashX + 1.5, frameY + 1.5, sashWidth - 3, frameH - 3, "F");
    doc.setDrawColor(120, 157, 225);
    doc.setLineWidth(0.45);
    doc.rect(sashX + 1.5, frameY + 1.5, sashWidth - 3, frameH - 3);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(66, 76, 95);
  doc.text(`${Math.round(widthMm)} mm`, frameX + frameW / 2, y + 8, { align: "center" });
  doc.text(`${Math.round(heightMm)} mm`, x + width - 3, frameY + frameH / 2, { align: "right" });
};

export const downloadQuotationPdf = (quotation: QuotationRecord) => {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const horizontalPadding = 32;

  doc.setFillColor(12, 48, 84);
  doc.rect(0, 0, pageWidth, 74, "F");

  if (quotation.company.logoDataUrl) {
    try {
      doc.addImage(quotation.company.logoDataUrl, "PNG", horizontalPadding, 14, 38, 38, undefined, "FAST");
    } catch {
      try {
        doc.addImage(quotation.company.logoDataUrl, "JPEG", horizontalPadding, 14, 38, 38, undefined, "FAST");
      } catch {
        // Ignore invalid image payload.
      }
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(quotation.company.name || "Company", horizontalPadding + 50, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Aluminium and Glass Systems", horizontalPadding + 50, 44);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("QUOTATION", pageWidth - horizontalPadding, 30, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Quote ID: ${quotation.id}`, pageWidth - horizontalPadding, 44, { align: "right" });

  doc.setTextColor(38, 52, 73);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Project: ${quotation.projectName || "-"}`, horizontalPadding, 92);
  doc.text(`Client: ${quotation.client || "-"}`, horizontalPadding + 230, 92);
  doc.text(`Date: ${quotation.date}`, pageWidth - horizontalPadding - 170, 92);
  doc.text(`Valid Until: ${quotation.validUntil}`, pageWidth - horizontalPadding - 170, 106);

  doc.setDrawColor(214, 224, 236);
  doc.line(horizontalPadding, 116, pageWidth - horizontalPadding, 116);

  const windows = quotation.windows || [];
  const windowRows = windows.length > 0 ? windows : [];

  const bodyRows =
    windowRows.length > 0
      ? windowRows.map((item, index) => [
          (index + 1).toString(),
          item.serialNumber,
          "",
          item.series,
          item.windowType,
          item.width.toString(),
          item.height.toString(),
          item.quantity.toString(),
          item.meshType,
          item.handleType || "-",
          item.glassType,
          item.totalAreaSqFt.toFixed(2),
          item.unitCost.toFixed(2),
          item.totalCost.toFixed(2),
        ])
      : quotation.lineItems.map((item, index) => [
          (index + 1).toString(),
          item.label,
          "",
          "-",
          "-",
          "-",
          "-",
          item.quantity.toString(),
          "-",
          "-",
          "-",
          "-",
          item.unitPrice.toFixed(2),
          item.totalPrice.toFixed(2),
        ]);

  const totalQuantity = windowRows.reduce((sum, item) => sum + item.quantity, 0);

  autoTable(doc, {
    startY: 126,
    tableWidth: pageWidth - horizontalPadding * 2,
    head: [["Sl No", "Code", "Design", "Series", "Window Type", "Width", "Height", "Qty", "Mesh", "Handle", "Glass", "Total Area (SqFt)", "Unit Rate", "Amount"]],
    body: bodyRows,
    foot: [["", "", "", "", "", "", "Total", totalQuantity.toString(), "", "", "", "", "", quotation.totalAmount.toFixed(2)]],
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 3,
      textColor: [35, 35, 35],
      lineColor: [212, 222, 234],
      lineWidth: 0.45,
      valign: "middle",
      minCellHeight: 64,
    },
    headStyles: {
      fillColor: [18, 88, 170],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      minCellHeight: 20,
    },
    footStyles: {
      fillColor: [245, 248, 253],
      textColor: [24, 41, 63],
      fontStyle: "bold",
      halign: "center",
      minCellHeight: 18,
    },
    columnStyles: {
      0: { cellWidth: 28, halign: "center" },
      1: { cellWidth: 38, halign: "center" },
      2: { cellWidth: 80 },
      3: { cellWidth: 90 },
      4: { cellWidth: 62 },
      5: { cellWidth: 44, halign: "right" },
      6: { cellWidth: 44, halign: "right" },
      7: { cellWidth: 28, halign: "right" },
      8: { cellWidth: 46 },
      9: { cellWidth: 78 },
      10: { cellWidth: 72 },
      11: { cellWidth: 50, halign: "right" },
      12: { cellWidth: 58, halign: "right" },
      13: { cellWidth: 60, halign: "right" },
    },
    margin: { left: horizontalPadding, right: horizontalPadding },
    didDrawCell: (data: CellHookData) => {
      if (data.section !== "body" || data.column.index !== 2) return;
      const windowItem = windowRows[data.row.index];
      if (!windowItem) return;

      const imageX = data.cell.x + 3;
      const imageY = data.cell.y + 3;
      const imageW = data.cell.width - 6;
      const imageH = data.cell.height - 6;
      drawWindowDesign(doc, windowItem.width, windowItem.height, windowItem.numTracks, imageX, imageY, imageW, imageH);
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 460;
  const summaryTop = finalY + 12;
  const summaryWidth = 240;
  const summaryHeight = 70;
  const summaryLeft = pageWidth - horizontalPadding - summaryWidth;

  doc.setFillColor(247, 250, 253);
  doc.roundedRect(summaryLeft, summaryTop, summaryWidth, summaryHeight, 8, 8, "F");
  doc.setDrawColor(213, 224, 236);
  doc.roundedRect(summaryLeft, summaryTop, summaryWidth, summaryHeight, 8, 8, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(41, 57, 73);
  doc.text("Subtotal", summaryLeft + 14, summaryTop + 22);
  doc.text(currency(quotation.amount), summaryLeft + summaryWidth - 14, summaryTop + 22, { align: "right" });
  doc.setFontSize(12);
  doc.text("Grand Total", summaryLeft + 14, summaryTop + 48);
  doc.setFontSize(14);
  doc.text(currency(quotation.totalAmount), summaryLeft + summaryWidth - 14, summaryTop + 48, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(93, 105, 121);
  doc.text("This is a system-generated quotation document.", horizontalPadding, pageHeight - 18);

  doc.save(`${quotation.id}.pdf`);
};

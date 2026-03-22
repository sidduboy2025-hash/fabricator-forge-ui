export interface OcrFile {
  id: string;
  fileName: string;
  fileType: "pdf" | "image";
  uploadDate: string;
  validationStatus: "validated" | "pending" | "errors" | "processing";
  extractedData?: {
    measurements: string[];
    materials: string[];
    components: string[];
  };
  confidence: number;
}

export const ocrFiles: OcrFile[] = [
  { id: "OCR-001", fileName: "marina-bay-floor3-drawing.pdf", fileType: "pdf", uploadDate: "2026-03-21T10:30:00", validationStatus: "validated", extractedData: { measurements: ["2400mm x 1800mm", "1200mm x 900mm", "3600mm x 2100mm"], materials: ["Aluminium Profile 60mm", "Tempered Glass 8mm"], components: ["Fixed Window", "Sliding Door", "Ventilator"] }, confidence: 94 },
  { id: "OCR-002", fileName: "greenfield-elevation-west.pdf", fileType: "pdf", uploadDate: "2026-03-20T14:15:00", validationStatus: "pending", extractedData: { measurements: ["5400mm x 3000mm", "1800mm x 2400mm"], materials: ["Curtain Wall Profile", "DGU Glass"], components: ["Curtain Wall Panel", "Awning Window"] }, confidence: 78 },
  { id: "OCR-003", fileName: "metro-station-facade-spec.pdf", fileType: "pdf", uploadDate: "2026-03-19T09:00:00", validationStatus: "errors", extractedData: { measurements: ["12000mm x 4500mm", "???mm x 2100mm"], materials: ["Structural Glazing", "Spider Fitting"], components: ["Glass Facade", "Entry Door"] }, confidence: 52 },
  { id: "OCR-004", fileName: "villa-cluster-window-photo.jpg", fileType: "image", uploadDate: "2026-03-18T16:45:00", validationStatus: "validated", extractedData: { measurements: ["1500mm x 1200mm", "900mm x 600mm"], materials: ["UPVC Profile", "Float Glass 5mm"], components: ["Casement Window", "Fixed Lite"] }, confidence: 88 },
  { id: "OCR-005", fileName: "airport-t3-section-a.pdf", fileType: "pdf", uploadDate: "2026-03-22T08:00:00", validationStatus: "processing", confidence: 0 },
  { id: "OCR-006", fileName: "convention-dome-panel-layout.pdf", fileType: "pdf", uploadDate: "2026-03-17T11:30:00", validationStatus: "validated", extractedData: { measurements: ["Curved Panel R=8000mm", "2100mm x 3600mm", "1800mm x 2400mm"], materials: ["Aluminium Profile 75mm", "Laminated Glass 10mm"], components: ["Curved Panel", "Fixed Glazing", "Access Door"] }, confidence: 91 },
  { id: "OCR-007", fileName: "hotel-restoration-details.jpg", fileType: "image", uploadDate: "2026-03-15T13:00:00", validationStatus: "errors", extractedData: { measurements: ["1200mm x ??mm", "Arch R=600mm"], materials: ["Wooden Profile (?)"], components: ["Arched Window", "Heritage Frame"] }, confidence: 41 },
];

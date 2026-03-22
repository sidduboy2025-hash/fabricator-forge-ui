export interface ActivityItem {
  id: string;
  action: string;
  user: string;
  module: string;
  timestamp: string;
  details?: string;
}

export const activityLog: ActivityItem[] = [
  { id: "ACT-001", action: "Project processed", user: "Ravi Kumar", module: "Projects", timestamp: "2026-03-22T09:15:00", details: "PRJ-014 batch processing completed — 3,900 SFT deducted" },
  { id: "ACT-002", action: "Invoice generated", user: "Priya Sharma", module: "Payments", timestamp: "2026-03-22T08:45:00", details: "INV-2026-019 draft created for SBI Capital" },
  { id: "ACT-003", action: "Stock alert triggered", user: "System", module: "Inventory", timestamp: "2026-03-22T08:30:00", details: "Thermal Break Profile below minimum — 180/200 meters" },
  { id: "ACT-004", action: "OCR file uploaded", user: "Anil Reddy", module: "OCR", timestamp: "2026-03-22T08:00:00", details: "airport-t3-section-a.pdf — processing started" },
  { id: "ACT-005", action: "Payment received", user: "Priya Sharma", module: "Payments", timestamp: "2026-03-21T16:30:00", details: "₹1,73,460 from DPS Society — INV-2026-013" },
  { id: "ACT-006", action: "Pricing rule updated", user: "Ravi Kumar", module: "Pricing", timestamp: "2026-03-21T14:00:00", details: "South India Structural Glazing retail rate updated" },
  { id: "ACT-007", action: "Credits purchased", user: "Ravi Kumar", module: "Billing", timestamp: "2026-03-18T09:00:00", details: "50,000 credits added to wallet" },
  { id: "ACT-008", action: "Supply chain sync failed", user: "System", module: "Supply Chain", timestamp: "2026-03-19T09:30:00", details: "South Zone Hardware Supply — connection timeout" },
  { id: "ACT-009", action: "Project created", user: "Anil Reddy", module: "Projects", timestamp: "2026-03-20T10:00:00", details: "PRJ-011 Warehouse Skylights Installation — draft" },
  { id: "ACT-010", action: "Batch optimization run", user: "Ravi Kumar", module: "Batch", timestamp: "2026-03-17T15:00:00", details: "3 projects combined — 12% material savings" },
  { id: "ACT-011", action: "Stock received", user: "Warehouse Team", module: "Inventory", timestamp: "2026-03-16T11:00:00", details: "Multi-Point Lock — 100 pieces added" },
  { id: "ACT-012", action: "GST report exported", user: "Priya Sharma", module: "Reports", timestamp: "2026-03-15T17:00:00", details: "Q4 2025 GST summary — PDF exported" },
];

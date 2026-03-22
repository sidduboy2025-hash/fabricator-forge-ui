export interface Invoice {
  id: string;
  client: string;
  projectId: string;
  amount: number;
  gst: number;
  totalAmount: number;
  status: "paid" | "pending" | "overdue" | "draft";
  issueDate: string;
  dueDate: string;
  paidDate?: string;
}

export const invoices: Invoice[] = [
  { id: "INV-2026-001", client: "Horizon Builders", projectId: "PRJ-001", amount: 218550, gst: 39339, totalAmount: 257889, status: "paid", issueDate: "2026-01-20", dueDate: "2026-02-19", paidDate: "2026-02-15" },
  { id: "INV-2026-002", client: "Horizon Builders", projectId: "PRJ-001", amount: 218550, gst: 39339, totalAmount: 257889, status: "paid", issueDate: "2026-02-15", dueDate: "2026-03-17", paidDate: "2026-03-10" },
  { id: "INV-2026-003", client: "Horizon Builders", projectId: "PRJ-001", amount: 218550, gst: 39339, totalAmount: 257889, status: "pending", issueDate: "2026-03-15", dueDate: "2026-04-14" },
  { id: "INV-2026-004", client: "Vertex Infra Pvt Ltd", projectId: "PRJ-002", amount: 153125, gst: 27562, totalAmount: 180687, status: "paid", issueDate: "2026-02-10", dueDate: "2026-03-12", paidDate: "2026-03-05" },
  { id: "INV-2026-005", client: "Vertex Infra Pvt Ltd", projectId: "PRJ-002", amount: 153125, gst: 27562, totalAmount: 180687, status: "overdue", issueDate: "2026-03-01", dueDate: "2026-03-15" },
  { id: "INV-2026-006", client: "Sai Constructions", projectId: "PRJ-003", amount: 364000, gst: 65520, totalAmount: 429520, status: "paid", issueDate: "2025-12-15", dueDate: "2026-01-14", paidDate: "2026-01-10" },
  { id: "INV-2026-007", client: "DMRC Contractors", projectId: "PRJ-004", amount: 330750, gst: 59535, totalAmount: 390285, status: "pending", issueDate: "2026-03-10", dueDate: "2026-04-09" },
  { id: "INV-2026-008", client: "Phoenix Mills", projectId: "PRJ-007", amount: 284000, gst: 51120, totalAmount: 335120, status: "paid", issueDate: "2026-01-05", dueDate: "2026-02-04", paidDate: "2026-01-28" },
  { id: "INV-2026-009", client: "Phoenix Mills", projectId: "PRJ-007", amount: 284000, gst: 51120, totalAmount: 335120, status: "paid", issueDate: "2026-02-05", dueDate: "2026-03-07", paidDate: "2026-03-01" },
  { id: "INV-2026-010", client: "Phoenix Mills", projectId: "PRJ-007", amount: 284000, gst: 51120, totalAmount: 335120, status: "pending", issueDate: "2026-03-05", dueDate: "2026-04-04" },
  { id: "INV-2026-011", client: "Apollo Healthcare", projectId: "PRJ-008", amount: 544000, gst: 97920, totalAmount: 641920, status: "paid", issueDate: "2025-12-20", dueDate: "2026-01-19", paidDate: "2026-01-12" },
  { id: "INV-2026-012", client: "GMR Group", projectId: "PRJ-009", amount: 585000, gst: 105300, totalAmount: 690300, status: "pending", issueDate: "2026-03-01", dueDate: "2026-03-31" },
  { id: "INV-2026-013", client: "DPS Society", projectId: "PRJ-010", amount: 147000, gst: 26460, totalAmount: 173460, status: "paid", issueDate: "2026-02-25", dueDate: "2026-03-27", paidDate: "2026-03-20" },
  { id: "INV-2026-014", client: "HITEX Foundation", projectId: "PRJ-013", amount: 252000, gst: 45360, totalAmount: 297360, status: "overdue", issueDate: "2026-02-20", dueDate: "2026-03-07" },
  { id: "INV-2026-015", client: "Prestige Group", projectId: "PRJ-014", amount: 136500, gst: 24570, totalAmount: 161070, status: "paid", issueDate: "2026-01-15", dueDate: "2026-02-14", paidDate: "2026-02-10" },
  { id: "INV-2026-016", client: "Prestige Group", projectId: "PRJ-014", amount: 136500, gst: 24570, totalAmount: 161070, status: "pending", issueDate: "2026-03-10", dueDate: "2026-04-09" },
  { id: "INV-2026-017", client: "Arvind Mills", projectId: "PRJ-016", amount: 287000, gst: 51660, totalAmount: 338660, status: "paid", issueDate: "2025-11-25", dueDate: "2025-12-25", paidDate: "2025-12-20" },
  { id: "INV-2026-018", client: "Taj Properties", projectId: "PRJ-005", amount: 85000, gst: 15300, totalAmount: 100300, status: "overdue", issueDate: "2026-01-25", dueDate: "2026-02-24" },
  { id: "INV-2026-019", client: "SBI Capital", projectId: "PRJ-012", amount: 175500, gst: 31590, totalAmount: 207090, status: "draft", issueDate: "2026-03-20", dueDate: "2026-04-19" },
  { id: "INV-2026-020", client: "Yotta Infrastructure", projectId: "PRJ-015", amount: 139500, gst: 25110, totalAmount: 164610, status: "draft", issueDate: "2026-03-21", dueDate: "2026-04-20" },
];

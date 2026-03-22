export interface WalletTransaction {
  id: string;
  type: "credit-purchase" | "sft-deduction" | "refund" | "bonus";
  description: string;
  amount: number;
  sftUnits?: number;
  balanceAfter: number;
  date: string;
}

export const walletBalance = 47250;
export const totalCreditsUsed = 152750;
export const totalCreditsPurchased = 200000;

export const walletTransactions: WalletTransaction[] = [
  { id: "TXN-001", type: "sft-deduction", description: "PRJ-014 — Residential Villa Cluster processing", amount: -2730, sftUnits: 3900, balanceAfter: 47250, date: "2026-03-21T14:30:00" },
  { id: "TXN-002", type: "sft-deduction", description: "PRJ-013 — Convention Center Glass Dome batch", amount: -3920, sftUnits: 5600, balanceAfter: 49980, date: "2026-03-20T11:15:00" },
  { id: "TXN-003", type: "credit-purchase", description: "Credit top-up — 50,000 credits", amount: 50000, balanceAfter: 53900, date: "2026-03-18T09:00:00" },
  { id: "TXN-004", type: "sft-deduction", description: "PRJ-009 — Airport Terminal T3 initial batch", amount: -5850, sftUnits: 8357, balanceAfter: 3900, date: "2026-03-15T16:45:00" },
  { id: "TXN-005", type: "sft-deduction", description: "PRJ-007 — Shopping Mall Atrium section B", amount: -4970, sftUnits: 7100, balanceAfter: 9750, date: "2026-03-12T10:20:00" },
  { id: "TXN-006", type: "credit-purchase", description: "Credit top-up — 25,000 credits", amount: 25000, balanceAfter: 14720, date: "2026-03-10T08:30:00" },
  { id: "TXN-007", type: "refund", description: "PRJ-005 — Heritage Hotel hold refund", amount: 1200, balanceAfter: -10280, date: "2026-03-08T12:00:00" },
  { id: "TXN-008", type: "sft-deduction", description: "PRJ-001 — Marina Bay Tower section 3", amount: -4368, sftUnits: 6240, balanceAfter: -11480, date: "2026-03-05T15:30:00" },
  { id: "TXN-009", type: "bonus", description: "Monthly loyalty bonus", amount: 2500, balanceAfter: -7112, date: "2026-03-01T00:00:00" },
  { id: "TXN-010", type: "credit-purchase", description: "Credit top-up — 75,000 credits", amount: 75000, balanceAfter: -9612, date: "2026-02-25T09:15:00" },
  { id: "TXN-011", type: "sft-deduction", description: "PRJ-002 — Greenfield Office Complex batch 1", amount: -3062, sftUnits: 4375, balanceAfter: -84612, date: "2026-02-20T13:00:00" },
  { id: "TXN-012", type: "sft-deduction", description: "PRJ-001 — Marina Bay Tower section 2", amount: -4368, sftUnits: 6240, balanceAfter: -81550, date: "2026-02-10T11:00:00" },
  { id: "TXN-013", type: "credit-purchase", description: "Initial credit purchase — 50,000 credits", amount: 50000, balanceAfter: -77182, date: "2026-01-20T10:00:00" },
];

export const revenueData = [
  { month: "Oct", revenue: 145000 },
  { month: "Nov", revenue: 168000 },
  { month: "Dec", revenue: 210000 },
  { month: "Jan", revenue: 185000 },
  { month: "Feb", revenue: 240000 },
  { month: "Mar", revenue: 285000 },
];

export const sftUsageHistory = [
  { date: "Mar 10", sftUsed: 4200 },
  { date: "Mar 11", sftUsed: 3800 },
  { date: "Mar 12", sftUsed: 7100 },
  { date: "Mar 13", sftUsed: 2900 },
  { date: "Mar 14", sftUsed: 6400 },
  { date: "Mar 15", sftUsed: 8357 },
  { date: "Mar 16", sftUsed: 5100 },
  { date: "Mar 17", sftUsed: 4800 },
  { date: "Mar 18", sftUsed: 3200 },
  { date: "Mar 19", sftUsed: 6100 },
  { date: "Mar 20", sftUsed: 5600 },
  { date: "Mar 21", sftUsed: 3900 },
];

export const currentSftRate = 0.70;

export interface Project {
  id: string;
  name: string;
  client: string;
  sft: number;
  status: "active" | "completed" | "pending" | "on-hold" | "draft";
  cost: number;
  progress: number;
  createdAt: string;
  dueDate: string;
}

export const projects: Project[] = [
  { id: "PRJ-001", name: "Marina Bay Tower Glazing", client: "Horizon Builders", sft: 12480, status: "active", cost: 874200, progress: 68, createdAt: "2026-01-15", dueDate: "2026-04-30" },
  { id: "PRJ-002", name: "Greenfield Office Complex", client: "Vertex Infra Pvt Ltd", sft: 8750, status: "active", cost: 612500, progress: 42, createdAt: "2026-02-03", dueDate: "2026-05-15" },
  { id: "PRJ-003", name: "Lakeview Residences Phase 2", client: "Sai Constructions", sft: 5200, status: "completed", cost: 364000, progress: 100, createdAt: "2025-10-20", dueDate: "2026-01-31" },
  { id: "PRJ-004", name: "Metro Station Facade", client: "DMRC Contractors", sft: 18900, status: "active", cost: 1323000, progress: 25, createdAt: "2026-03-01", dueDate: "2026-08-30" },
  { id: "PRJ-005", name: "Heritage Hotel Restoration", client: "Taj Properties", sft: 3400, status: "on-hold", cost: 340000, progress: 15, createdAt: "2026-01-10", dueDate: "2026-06-15" },
  { id: "PRJ-006", name: "IT Park Block C Windows", client: "DLF Cyber Park", sft: 9600, status: "pending", cost: 672000, progress: 0, createdAt: "2026-03-18", dueDate: "2026-07-20" },
  { id: "PRJ-007", name: "Shopping Mall Atrium", client: "Phoenix Mills", sft: 14200, status: "active", cost: 1136000, progress: 55, createdAt: "2025-12-01", dueDate: "2026-04-15" },
  { id: "PRJ-008", name: "Hospital Wing Extension", client: "Apollo Healthcare", sft: 6800, status: "completed", cost: 544000, progress: 100, createdAt: "2025-09-15", dueDate: "2025-12-31" },
  { id: "PRJ-009", name: "Airport Terminal T3 Curtain Wall", client: "GMR Group", sft: 32500, status: "active", cost: 2925000, progress: 18, createdAt: "2026-02-20", dueDate: "2026-12-31" },
  { id: "PRJ-010", name: "School Building Fenestration", client: "DPS Society", sft: 2100, status: "completed", cost: 147000, progress: 100, createdAt: "2025-11-01", dueDate: "2026-02-28" },
  { id: "PRJ-011", name: "Warehouse Skylights Installation", client: "Reliance Logistics", sft: 4500, status: "draft", cost: 270000, progress: 0, createdAt: "2026-03-20", dueDate: "2026-05-30" },
  { id: "PRJ-012", name: "Bank HQ Facade Retrofit", client: "SBI Capital", sft: 7800, status: "pending", cost: 702000, progress: 0, createdAt: "2026-03-15", dueDate: "2026-06-30" },
  { id: "PRJ-013", name: "Convention Center Glass Dome", client: "HITEX Foundation", sft: 11200, status: "active", cost: 1008000, progress: 35, createdAt: "2026-01-25", dueDate: "2026-06-30" },
  { id: "PRJ-014", name: "Residential Villa Cluster", client: "Prestige Group", sft: 3900, status: "active", cost: 273000, progress: 72, createdAt: "2025-12-10", dueDate: "2026-03-31" },
  { id: "PRJ-015", name: "Data Center Facade Panels", client: "Yotta Infrastructure", sft: 6200, status: "on-hold", cost: 558000, progress: 8, createdAt: "2026-02-14", dueDate: "2026-07-31" },
  { id: "PRJ-016", name: "Textile Mill Renovation", client: "Arvind Mills", sft: 4100, status: "completed", cost: 287000, progress: 100, createdAt: "2025-08-20", dueDate: "2025-11-30" },
];

export interface SupplyChainEntity {
  id: string;
  name: string;
  type: "trader" | "distributor" | "fabricator";
  location: string;
  status: "active" | "inactive";
  linkedEntities: string[];
  lastSync: string;
  syncStatus: "synced" | "pending" | "error";
}

export const supplyChainEntities: SupplyChainEntity[] = [
  { id: "SC-001", name: "Acme Fabricators", type: "fabricator", location: "Hyderabad", status: "active", linkedEntities: ["SC-004", "SC-005"], lastSync: "2026-03-22T08:00:00", syncStatus: "synced" },
  { id: "SC-002", name: "Southern Glass Works", type: "fabricator", location: "Chennai", status: "active", linkedEntities: ["SC-004"], lastSync: "2026-03-21T14:30:00", syncStatus: "synced" },
  { id: "SC-003", name: "Metro Aluminium Fab", type: "fabricator", location: "Bangalore", status: "active", linkedEntities: ["SC-005", "SC-006"], lastSync: "2026-03-20T10:15:00", syncStatus: "pending" },
  { id: "SC-004", name: "National Glass Distributors", type: "distributor", location: "Mumbai", status: "active", linkedEntities: ["SC-001", "SC-002", "SC-007", "SC-008"], lastSync: "2026-03-22T07:45:00", syncStatus: "synced" },
  { id: "SC-005", name: "Premier Profiles Pvt Ltd", type: "distributor", location: "Delhi", status: "active", linkedEntities: ["SC-001", "SC-003", "SC-009"], lastSync: "2026-03-21T16:00:00", syncStatus: "synced" },
  { id: "SC-006", name: "South Zone Hardware Supply", type: "distributor", location: "Hyderabad", status: "active", linkedEntities: ["SC-003", "SC-010"], lastSync: "2026-03-19T09:30:00", syncStatus: "error" },
  { id: "SC-007", name: "Guardian Glass India", type: "trader", location: "Mumbai", status: "active", linkedEntities: ["SC-004"], lastSync: "2026-03-22T06:00:00", syncStatus: "synced" },
  { id: "SC-008", name: "Saint-Gobain Trading", type: "trader", location: "Chennai", status: "active", linkedEntities: ["SC-004"], lastSync: "2026-03-21T12:00:00", syncStatus: "synced" },
  { id: "SC-009", name: "Jindal Aluminium Traders", type: "trader", location: "Bangalore", status: "active", linkedEntities: ["SC-005"], lastSync: "2026-03-20T08:00:00", syncStatus: "pending" },
  { id: "SC-010", name: "Fenesta Building Systems", type: "trader", location: "Delhi", status: "inactive", linkedEntities: ["SC-006"], lastSync: "2026-03-10T10:00:00", syncStatus: "error" },
];

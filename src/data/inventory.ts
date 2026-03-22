export interface InventoryItem {
  id: string;
  itemName: string;
  category: "profiles" | "glass" | "hardware";
  quantity: number;
  unit: string;
  location: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
  minStock: number;
  lastUpdated: string;
}

export const inventory: InventoryItem[] = [
  { id: "INV-001", itemName: "Aluminium Profile 60mm", category: "profiles", quantity: 4200, unit: "meters", location: "Warehouse A", status: "in-stock", minStock: 500, lastUpdated: "2026-03-21" },
  { id: "INV-002", itemName: "Aluminium Profile 45mm", category: "profiles", quantity: 2800, unit: "meters", location: "Warehouse A", status: "in-stock", minStock: 400, lastUpdated: "2026-03-20" },
  { id: "INV-003", itemName: "Thermal Break Profile", category: "profiles", quantity: 180, unit: "meters", location: "Warehouse B", status: "low-stock", minStock: 200, lastUpdated: "2026-03-19" },
  { id: "INV-004", itemName: "Mullion Profile 100mm", category: "profiles", quantity: 1500, unit: "meters", location: "Warehouse A", status: "in-stock", minStock: 300, lastUpdated: "2026-03-18" },
  { id: "INV-005", itemName: "Corner Profile 90°", category: "profiles", quantity: 0, unit: "pieces", location: "Warehouse B", status: "out-of-stock", minStock: 50, lastUpdated: "2026-03-15" },
  { id: "INV-006", itemName: "Sliding Track Profile", category: "profiles", quantity: 320, unit: "meters", location: "Warehouse A", status: "in-stock", minStock: 100, lastUpdated: "2026-03-21" },
  { id: "INV-007", itemName: "Casement Profile Set", category: "profiles", quantity: 85, unit: "sets", location: "Warehouse B", status: "low-stock", minStock: 100, lastUpdated: "2026-03-17" },
  { id: "INV-008", itemName: "Float Glass 5mm Clear", category: "glass", quantity: 3200, unit: "sqft", location: "Glass Store 1", status: "in-stock", minStock: 500, lastUpdated: "2026-03-21" },
  { id: "INV-009", itemName: "Float Glass 6mm Clear", category: "glass", quantity: 2100, unit: "sqft", location: "Glass Store 1", status: "in-stock", minStock: 400, lastUpdated: "2026-03-20" },
  { id: "INV-010", itemName: "Tempered Glass 8mm", category: "glass", quantity: 1800, unit: "sqft", location: "Glass Store 2", status: "in-stock", minStock: 300, lastUpdated: "2026-03-19" },
  { id: "INV-011", itemName: "Laminated Glass 10mm", category: "glass", quantity: 45, unit: "sqft", location: "Glass Store 2", status: "low-stock", minStock: 200, lastUpdated: "2026-03-16" },
  { id: "INV-012", itemName: "DGU 6+12+6 Clear", category: "glass", quantity: 900, unit: "sqft", location: "Glass Store 1", status: "in-stock", minStock: 200, lastUpdated: "2026-03-21" },
  { id: "INV-013", itemName: "Reflective Glass Blue", category: "glass", quantity: 0, unit: "sqft", location: "Glass Store 2", status: "out-of-stock", minStock: 150, lastUpdated: "2026-03-10" },
  { id: "INV-014", itemName: "Low-E Glass 6mm", category: "glass", quantity: 620, unit: "sqft", location: "Glass Store 1", status: "in-stock", minStock: 200, lastUpdated: "2026-03-18" },
  { id: "INV-015", itemName: "Tinted Glass 5mm Bronze", category: "glass", quantity: 380, unit: "sqft", location: "Glass Store 2", status: "in-stock", minStock: 100, lastUpdated: "2026-03-20" },
  { id: "INV-016", itemName: "Friction Stay 22inch", category: "hardware", quantity: 450, unit: "pieces", location: "Hardware Bay", status: "in-stock", minStock: 100, lastUpdated: "2026-03-21" },
  { id: "INV-017", itemName: "Multi-Point Lock", category: "hardware", quantity: 220, unit: "pieces", location: "Hardware Bay", status: "in-stock", minStock: 50, lastUpdated: "2026-03-20" },
  { id: "INV-018", itemName: "Sliding Roller Heavy Duty", category: "hardware", quantity: 35, unit: "sets", location: "Hardware Bay", status: "low-stock", minStock: 40, lastUpdated: "2026-03-19" },
  { id: "INV-019", itemName: "Handle Set Premium", category: "hardware", quantity: 180, unit: "sets", location: "Hardware Bay", status: "in-stock", minStock: 30, lastUpdated: "2026-03-18" },
  { id: "INV-020", itemName: "Weather Strip EPDM", category: "hardware", quantity: 5200, unit: "meters", location: "Hardware Bay", status: "in-stock", minStock: 500, lastUpdated: "2026-03-21" },
  { id: "INV-021", itemName: "Silicone Sealant (Black)", category: "hardware", quantity: 0, unit: "tubes", location: "Hardware Bay", status: "out-of-stock", minStock: 100, lastUpdated: "2026-03-12" },
  { id: "INV-022", itemName: "Corner Cleat 90°", category: "hardware", quantity: 800, unit: "pieces", location: "Hardware Bay", status: "in-stock", minStock: 200, lastUpdated: "2026-03-17" },
  { id: "INV-023", itemName: "Espagnolette Lock", category: "hardware", quantity: 62, unit: "pieces", location: "Hardware Bay", status: "in-stock", minStock: 30, lastUpdated: "2026-03-16" },
  { id: "INV-024", itemName: "Hinges SS 4inch", category: "hardware", quantity: 15, unit: "pairs", location: "Hardware Bay", status: "low-stock", minStock: 50, lastUpdated: "2026-03-14" },
  { id: "INV-025", itemName: "Aluminium Profile 75mm", category: "profiles", quantity: 1200, unit: "meters", location: "Warehouse A", status: "in-stock", minStock: 200, lastUpdated: "2026-03-20" },
  { id: "INV-026", itemName: "Frosted Glass 5mm", category: "glass", quantity: 280, unit: "sqft", location: "Glass Store 2", status: "in-stock", minStock: 100, lastUpdated: "2026-03-19" },
  { id: "INV-027", itemName: "Screws M6x25 SS", category: "hardware", quantity: 12000, unit: "pieces", location: "Hardware Bay", status: "in-stock", minStock: 2000, lastUpdated: "2026-03-21" },
  { id: "INV-028", itemName: "Structural Glazing Tape", category: "hardware", quantity: 42, unit: "rolls", location: "Hardware Bay", status: "low-stock", minStock: 50, lastUpdated: "2026-03-15" },
  { id: "INV-029", itemName: "Powder Coat Profile 50mm", category: "profiles", quantity: 950, unit: "meters", location: "Warehouse B", status: "in-stock", minStock: 200, lastUpdated: "2026-03-18" },
  { id: "INV-030", itemName: "Spider Fitting 4-Way", category: "hardware", quantity: 28, unit: "pieces", location: "Hardware Bay", status: "in-stock", minStock: 10, lastUpdated: "2026-03-17" },
];

export interface StockOperation {
  id: string;
  itemId: string;
  itemName: string;
  type: "in" | "out" | "bom-deduction";
  quantity: number;
  date: string;
  reference?: string;
}

export const stockOperationsLog: StockOperation[] = [
  { id: "OP-1001", itemId: "INV-001", itemName: "Aluminium Profile 60mm", type: "in", quantity: 500, date: "2026-03-22T09:15:00", reference: "PO-4412" },
  { id: "OP-1002", itemId: "INV-005", itemName: "Corner Profile 90°", type: "bom-deduction", quantity: -120, date: "2026-03-21T14:30:00", reference: "PRJ-014 (BOM-882)" },
  { id: "OP-1003", itemId: "INV-012", itemName: "DGU 6+12+6 Clear", type: "out", quantity: -45, date: "2026-03-20T11:00:00", reference: "Manual Dispatch" },
  { id: "OP-1004", itemId: "INV-018", itemName: "Sliding Roller Heavy Duty", type: "bom-deduction", quantity: -24, date: "2026-03-19T16:20:00", reference: "PRJ-009 (BOM-715)" },
  { id: "OP-1005", itemId: "INV-021", itemName: "Silicone Sealant (Black)", type: "bom-deduction", quantity: -15, date: "2026-03-18T10:45:00", reference: "PRJ-009 (BOM-715)" },
  { id: "OP-1006", itemId: "INV-008", itemName: "Float Glass 5mm Clear", type: "in", quantity: 1000, date: "2026-03-15T08:30:00", reference: "PO-4390" },
];

export const stockAlerts = [
  { month: "Oct", lowStockEvents: 12, outOfStockEvents: 2 },
  { month: "Nov", lowStockEvents: 8, outOfStockEvents: 1 },
  { month: "Dec", lowStockEvents: 15, outOfStockEvents: 4 },
  { month: "Jan", lowStockEvents: 10, outOfStockEvents: 0 },
  { month: "Feb", lowStockEvents: 18, outOfStockEvents: 5 },
  { month: "Mar", lowStockEvents: 6, outOfStockEvents: 2 },
];

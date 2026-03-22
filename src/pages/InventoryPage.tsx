import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { MetricCard } from "@/components/MetricCard";
import { inventory, InventoryItem } from "@/data/inventory";
import { Plus, Package, GlassWater, Wrench } from "lucide-react";

const columns: Column<InventoryItem>[] = [
  { key: "id", label: "ID", sortable: true, className: "font-mono text-xs w-24" },
  { key: "itemName", label: "Item Name", sortable: true, render: (r) => <span className="font-medium">{r.itemName}</span> },
  { key: "category", label: "Category", sortable: true, render: (r) => <span className="capitalize">{r.category}</span> },
  { key: "quantity", label: "Qty", sortable: true, render: (r) => <span className="tabular-nums">{r.quantity.toLocaleString()}</span> },
  { key: "unit", label: "Unit" },
  { key: "location", label: "Location", sortable: true },
  { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
];

export default function InventoryPage() {
  const profiles = inventory.filter((i) => i.category === "profiles");
  const glass = inventory.filter((i) => i.category === "glass");
  const hardware = inventory.filter((i) => i.category === "hardware");

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Inventory"
        description="Track stock levels across profiles, glass, and hardware"
        actions={[{ label: "Add Stock", icon: Plus }]}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard label="Profiles" value={`${profiles.length} items`} icon={Package} trend={{ value: -2, label: "low stock items" }} />
        <MetricCard label="Glass" value={`${glass.length} items`} icon={GlassWater} />
        <MetricCard label="Hardware" value={`${hardware.length} items`} icon={Wrench} trend={{ value: -4, label: "items need restock" }} />
      </div>

      <DataTable columns={columns} data={inventory} selectable searchPlaceholder="Search inventory..." />
    </div>
  );
}

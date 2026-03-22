import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column } from "@/components/DataTable";
import { pricingRules, PricingRule } from "@/data/pricingRules";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus } from "lucide-react";

const columns: Column<PricingRule>[] = [
  { key: "id", label: "ID", sortable: true, className: "font-mono text-xs w-20" },
  { key: "region", label: "Region", sortable: true },
  { key: "customerType", label: "Customer Type", sortable: true, render: (r) => <span className="capitalize">{r.customerType}</span> },
  { key: "material", label: "Material", sortable: true },
  { key: "pricePerSft", label: "₹/SFT", sortable: true, render: (r) => <span className="tabular-nums font-medium">₹{r.pricePerSft}</span> },
  { key: "margin", label: "Margin %", sortable: true, render: (r) => <span className="tabular-nums">{r.margin}%</span> },
  { key: "markup", label: "Markup %", sortable: true, render: (r) => <span className="tabular-nums">{r.markup}%</span> },
  { key: "isActive", label: "Status", render: (r) => <StatusBadge status={r.isActive ? "active" : "inactive"} /> },
];

export default function PricingPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Pricing Engine"
        description="Configure region and customer-type pricing rules"
        actions={[{ label: "Add Rule", icon: Plus }]}
      />
      <DataTable columns={columns} data={pricingRules} searchPlaceholder="Search pricing rules..." />
    </div>
  );
}

import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column } from "@/components/DataTable";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { invoices, Invoice } from "@/data/invoices";
import { Plus, FileText, AlertTriangle, CheckCircle } from "lucide-react";

const columns: Column<Invoice>[] = [
  { key: "id", label: "Invoice ID", sortable: true, className: "font-mono text-xs", render: (r) => <span className="font-medium">{r.id}</span> },
  { key: "client", label: "Client", sortable: true },
  { key: "amount", label: "Amount", sortable: true, render: (r) => <CurrencyDisplay amount={r.amount} /> },
  { key: "gst", label: "GST", render: (r) => <CurrencyDisplay amount={r.gst} className="text-muted-foreground" /> },
  { key: "totalAmount", label: "Total", sortable: true, render: (r) => <CurrencyDisplay amount={r.totalAmount} className="font-medium" /> },
  { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  { key: "dueDate", label: "Due Date", sortable: true, render: (r) => <span className="text-xs">{new Date(r.dueDate).toLocaleDateString("en-IN")}</span> },
];

export default function PaymentsPage() {
  const paid = invoices.filter((i) => i.status === "paid");
  const pending = invoices.filter((i) => i.status === "pending");
  const overdue = invoices.filter((i) => i.status === "overdue");

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Payments"
        description="Track invoices, payments, and outstanding balances"
        actions={[{ label: "Record Payment", icon: Plus }]}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard label="Paid" value={`₹${paid.reduce((s, i) => s + i.totalAmount, 0).toLocaleString("en-IN")}`} icon={CheckCircle} />
        <MetricCard label="Pending" value={`₹${pending.reduce((s, i) => s + i.totalAmount, 0).toLocaleString("en-IN")}`} icon={FileText} />
        <MetricCard label="Overdue" value={`₹${overdue.reduce((s, i) => s + i.totalAmount, 0).toLocaleString("en-IN")}`} icon={AlertTriangle} />
      </div>

      <DataTable columns={columns} data={invoices} selectable searchPlaceholder="Search invoices..." />
    </div>
  );
}

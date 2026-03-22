import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { invoices } from "@/data/invoices";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet } from "lucide-react";

export default function ReportsPage() {
  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const totalGst = paidInvoices.reduce((s, i) => s + i.gst, 0);
  const totalRevenue = paidInvoices.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Reports"
        description="Financial reports, GST summaries, and exports"
      >
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" /> Export PDF
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard label="Total Revenue (excl. GST)" value={`₹${totalRevenue.toLocaleString("en-IN")}`} icon={FileText} />
        <MetricCard label="Total GST Collected" value={`₹${totalGst.toLocaleString("en-IN")}`} icon={FileText} />
        <MetricCard label="Invoices Paid" value={paidInvoices.length} icon={FileText} />
      </div>

      <div className="rounded-lg border bg-card p-5">
        <h3 className="text-sm font-medium mb-3">GST Summary — Q1 2026</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="pb-2 text-left font-medium">Month</th>
                <th className="pb-2 text-right font-medium">Taxable Amount</th>
                <th className="pb-2 text-right font-medium">CGST</th>
                <th className="pb-2 text-right font-medium">SGST</th>
                <th className="pb-2 text-right font-medium">Total GST</th>
              </tr>
            </thead>
            <tbody>
              {[
                { month: "January 2026", taxable: 654050, cgst: 58864, sgst: 58864 },
                { month: "February 2026", taxable: 837625, cgst: 75386, sgst: 75386 },
                { month: "March 2026", taxable: 283500, cgst: 25515, sgst: 25515 },
              ].map((row) => (
                <tr key={row.month} className="border-b last:border-0">
                  <td className="py-2.5">{row.month}</td>
                  <td className="py-2.5 text-right tabular-nums">₹{row.taxable.toLocaleString("en-IN")}</td>
                  <td className="py-2.5 text-right tabular-nums">₹{row.cgst.toLocaleString("en-IN")}</td>
                  <td className="py-2.5 text-right tabular-nums">₹{row.sgst.toLocaleString("en-IN")}</td>
                  <td className="py-2.5 text-right tabular-nums font-medium">₹{(row.cgst + row.sgst).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

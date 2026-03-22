import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { DataTable, Column } from "@/components/DataTable";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { walletBalance, totalCreditsUsed, totalCreditsPurchased, walletTransactions, WalletTransaction } from "@/data/wallet";
import { Wallet, CreditCard, TrendingDown } from "lucide-react";

const columns: Column<WalletTransaction>[] = [
  { key: "id", label: "ID", className: "font-mono text-xs w-24" },
  { key: "type", label: "Type", sortable: true, render: (r) => (
    <span className={`text-xs font-medium capitalize ${r.type === "credit-purchase" ? "text-success" : r.type === "sft-deduction" ? "text-destructive" : r.type === "refund" ? "text-info" : "text-warning"}`}>
      {r.type.replace("-", " ")}
    </span>
  )},
  { key: "description", label: "Description", render: (r) => <span className="text-xs">{r.description}</span> },
  { key: "sftUnits", label: "SFT", render: (r) => r.sftUnits ? <span className="tabular-nums">{r.sftUnits.toLocaleString()}</span> : "—" },
  { key: "amount", label: "Amount", sortable: true, render: (r) => (
    <span className={`tabular-nums font-medium ${r.amount >= 0 ? "text-success" : "text-destructive"}`}>
      {r.amount >= 0 ? "+" : ""}₹{Math.abs(r.amount).toLocaleString("en-IN")}
    </span>
  )},
  { key: "date", label: "Date", sortable: true, render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("en-IN")}</span> },
];

export default function BillingPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Billing & Wallet"
        description="Manage credits, SFT billing, and wallet transactions"
        actions={[{ label: "Buy Credits", variant: "default" as const }]}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard label="Wallet Balance" value={`₹${walletBalance.toLocaleString("en-IN")}`} icon={Wallet} />
        <MetricCard label="Total Credits Used" value={`₹${totalCreditsUsed.toLocaleString("en-IN")}`} icon={TrendingDown} />
        <MetricCard label="Total Purchased" value={`₹${totalCreditsPurchased.toLocaleString("en-IN")}`} icon={CreditCard} />
      </div>

      <DataTable columns={columns} data={walletTransactions} searchPlaceholder="Search transactions..." />
    </div>
  );
}

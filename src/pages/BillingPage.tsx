import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { DataTable, Column } from "@/components/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentDialog } from "@/components/PaymentDialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useRole } from "@/contexts/RoleContext";
import { 
  walletBalance, 
  totalCreditsUsed, 
  totalCreditsPurchased, 
  walletTransactions, 
  WalletTransaction,
  revenueData,
  sftUsageHistory,
  currentSftRate
} from "@/data/wallet";
import { pricingRules, PricingRule } from "@/data/pricingRules";
import { Wallet, CreditCard, TrendingDown, IndianRupee, Activity, Database, FileText } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const transactionColumns: Column<WalletTransaction>[] = [
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

const pricingColumns: Column<PricingRule>[] = [
  { key: "id", label: "ID", sortable: true, className: "font-mono text-xs w-20" },
  { key: "region", label: "Region", sortable: true },
  { key: "customerType", label: "Customer Type", sortable: true, render: (r) => <span className="capitalize">{r.customerType}</span> },
  { key: "material", label: "Material", sortable: true },
  { key: "pricePerSft", label: "₹/SFT", sortable: true, render: (r) => <span className="tabular-nums font-medium">₹{r.pricePerSft}</span> },
  { key: "margin", label: "Margin %", sortable: true, render: (r) => <span className="tabular-nums">{r.margin}%</span> },
  { key: "markup", label: "Markup %", sortable: true, render: (r) => <span className="tabular-nums">{r.markup}%</span> },
  { key: "isActive", label: "Status", render: (r) => <StatusBadge status={r.isActive ? "active" : "inactive"} /> },
];

export default function BillingPage() {
  const { role } = useRole();
  const isAdminOrDistributor = role === "ADMIN" || role === "DISTRIBUTOR";
  const isAdmin = role === "ADMIN";
  const [activeTab, setActiveTab] = useState("wallet");

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="SaaS Billing & Monetization"
        description="Manage credits, pay-per-SFT billing, pricing engines, and revenue analytics."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-background border border-border">
          <TabsTrigger value="wallet" className="gap-2"><Wallet className="h-4 w-4" /> Wallet & Payments</TabsTrigger>
          <TabsTrigger value="sft-billing" className="gap-2"><Activity className="h-4 w-4" /> SFT Billing & Usage</TabsTrigger>
          {isAdmin && <TabsTrigger value="pricing-engine" className="gap-2"><Database className="h-4 w-4" /> Admin Pricing Controls</TabsTrigger>}
          {isAdminOrDistributor && <TabsTrigger value="revenue" className="gap-2"><FileText className="h-4 w-4" /> Revenue Reports</TabsTrigger>}
        </TabsList>

        <TabsContent value="wallet" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Wallet Overview</h3>
            <PaymentDialog>
              <Button variant="default"><CreditCard className="mr-2 h-4 w-4" /> Buy Credits</Button>
            </PaymentDialog>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard label="Wallet Balance" value={`₹${walletBalance.toLocaleString("en-IN")}`} icon={Wallet} />
            <MetricCard label="Total Credits Used" value={`₹${totalCreditsUsed.toLocaleString("en-IN")}`} icon={TrendingDown} />
            <MetricCard label="Total Purchased" value={`₹${totalCreditsPurchased.toLocaleString("en-IN")}`} icon={CreditCard} />
          </div>
          <div className="pt-4">
            <h3 className="text-lg font-medium mb-4">Transaction History</h3>
            <DataTable columns={transactionColumns} data={walletTransactions} searchPlaceholder="Search transactions..." />
          </div>
        </TabsContent>

        <TabsContent value="sft-billing" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard label="Current SFT Rate" value={`₹${currentSftRate.toFixed(2)} / SFT`} icon={IndianRupee} />
            <MetricCard label="Total SFT Deductions" value={walletTransactions.filter(t => t.type === 'sft-deduction').length.toString()} icon={Activity} />
            <MetricCard label="Total SFT Processed (All Time)" value={(152750 / currentSftRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} icon={Database} />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-6">SFT Usage Deduction Flow</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sftUsageHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSft" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dx={-10} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="sftUsed" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorSft)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">How Pay-per-SFT works</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Credits are automatically deducted from your wallet based on the square footage (SFT) extracted and processed by our OCR engines.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                    <div>
                      <p className="text-sm font-medium">Upload Document</p>
                      <p className="text-xs text-muted-foreground">PDFs or images are uploaded to the OCR engine.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
                    <div>
                      <p className="text-sm font-medium">Extract SFT</p>
                      <p className="text-xs text-muted-foreground">The AI engine identifies the total square footage.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
                    <div>
                      <p className="text-sm font-medium">Credit Deduction</p>
                      <p className="text-xs text-muted-foreground">Wallet is debited at the current SFT rate.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="pricing-engine" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Admin Pricing Controls</h3>
              <Button variant="default">Add Pricing Rule</Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Global control over pricing models, material markups, margins, and Pay-per-SFT tier settings.</p>
            <DataTable columns={pricingColumns} data={pricingRules} searchPlaceholder="Search pricing rules..." />
          </TabsContent>
        )}

        {isAdminOrDistributor && (
          <TabsContent value="revenue" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg font-medium">Revenue Analytics & Reports</h3>
            <p className="text-sm text-muted-foreground mb-4">Month-over-month recurring revenue tracking from SaaS margins and credit purchases.</p>
            
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm mb-6">
              <h3 className="font-semibold text-lg mb-6">Monthly Revenue (₹)</h3>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                    <RechartsTooltip 
                      cursor={{ fill: '#2a2a2a' }}
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                      itemStyle={{ color: '#10b981' }}
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

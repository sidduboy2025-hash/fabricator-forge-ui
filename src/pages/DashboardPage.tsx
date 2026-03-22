import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { StatusBadge } from "@/components/StatusBadge";
import { activityLog } from "@/data/activityLog";
import { walletBalance } from "@/data/wallet";
import { projects } from "@/data/projects";
import { inventory } from "@/data/inventory";
import { invoices } from "@/data/invoices";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  FileText,
  AlertTriangle,
  FolderKanban,
  BarChart3,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const pendingInvoices = invoices.filter((i) => i.status === "pending" || i.status === "overdue").length;
  const lowStockItems = inventory.filter((i) => i.status === "low-stock" || i.status === "out-of-stock").length;
  const totalSft = projects.reduce((sum, p) => sum + p.sft, 0);
  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.totalAmount, 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Dashboard" description="Business overview and operational summary" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Total SFT" value={totalSft.toLocaleString("en-IN")} icon={LayoutDashboard} trend={{ value: 12.4, label: "vs last month" }} />
        <MetricCard label="Wallet Balance" value={`₹${walletBalance.toLocaleString("en-IN")}`} icon={Wallet} />
        <MetricCard label="Revenue" value={`₹${(totalRevenue / 100000).toFixed(1)}L`} icon={TrendingUp} trend={{ value: 8.2, label: "vs last month" }} />
        <MetricCard label="Pending Invoices" value={pendingInvoices} icon={FileText} />
        <MetricCard label="Low Stock Alerts" value={lowStockItems} icon={AlertTriangle} />
        <MetricCard label="Active Projects" value={activeProjects} icon={FolderKanban} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Usage Meter */}
        <div className="rounded-lg border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium">SFT Consumption vs Credits</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly usage tracking</p>
            </div>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">SFT Used This Month</span>
                <span className="font-medium tabular-nums">42,800 / 60,000</span>
              </div>
              <Progress value={71} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Credits Consumed</span>
                <span className="font-medium tabular-nums">152,750 / 200,000</span>
              </div>
              <Progress value={76} className="h-2" />
            </div>
          </div>

          {/* Inventory Alerts */}
          <div className="mt-5 pt-4 border-t">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Stock Alerts</h4>
            <div className="space-y-1.5">
              {inventory
                .filter((i) => i.status !== "in-stock")
                .slice(0, 4)
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span>{item.itemName}</span>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
          <ActivityTimeline items={activityLog.slice(0, 6)} />
        </div>
      </div>

      {/* Pending Payments */}
      <div className="rounded-lg border bg-card p-5">
        <h3 className="text-sm font-medium mb-3">Pending & Overdue Payments</h3>
        <div className="space-y-2">
          {invoices
            .filter((i) => i.status === "pending" || i.status === "overdue")
            .slice(0, 5)
            .map((inv) => (
              <div key={inv.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                <div>
                  <span className="font-medium">{inv.id}</span>
                  <span className="text-muted-foreground ml-2 text-xs">{inv.client}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CurrencyDisplay amount={inv.totalAmount} className="text-sm font-medium" />
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { adminMetrics, revenueHistory } from "@/data/adminMetrics";
import { Users, TrendingUp, Activity, Server } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Admin Panel" description="Platform metrics, usage analytics, and system health" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Total Revenue" value={`₹${(adminMetrics.totalRevenue / 100000).toFixed(1)}L`} icon={TrendingUp} trend={{ value: 15.3, label: "vs last quarter" }} />
        <MetricCard label="Active Users" value={adminMetrics.activeUsers} icon={Users} trend={{ value: 3.2, label: "vs last month" }} />
        <MetricCard label="ARPU" value={`₹${adminMetrics.arpu}`} icon={Activity} />
        <MetricCard label="System Uptime" value={`${adminMetrics.systemUptime}%`} icon={Server} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-medium mb-3">Revenue Trend</h3>
          <div className="space-y-2">
            {revenueHistory.map((m) => (
              <div key={m.month} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                <span>{m.month}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{m.users} users</span>
                  <span className="tabular-nums font-medium">₹{m.revenue.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-medium mb-3">Usage Analytics</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total SFT Processed</span>
              <span className="tabular-nums font-medium">{adminMetrics.totalSftProcessed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly SFT</span>
              <span className="tabular-nums font-medium">{adminMetrics.monthlySftProcessed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Credit Consumption</span>
              <span className="tabular-nums font-medium">{adminMetrics.creditConsumption}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg Response Time</span>
              <span className="tabular-nums font-medium">{adminMetrics.avgResponseTime}ms</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Support Tickets</span>
              <span className="tabular-nums font-medium">{adminMetrics.supportTickets}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

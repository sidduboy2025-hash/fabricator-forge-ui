import { MetricCard } from "@/components/MetricCard";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, ChevronRight, FileText, Ruler, Zap, FolderPlus, 
  TrendingUp, TrendingDown, ArrowRight, Clock, CheckCircle2 
} from "lucide-react";
import { projects } from "@/data/projects";
import { activityLog } from "@/data/activityLog";
import { invoices } from "@/data/invoices";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();
  // 1. Action Required Items
  const pendingInvoicesCount = invoices.filter(i => i.status === 'pending').length;
  const actionItems = [
    { title: "Low Wallet Balance", desc: "Balance < ₹5,000", type: "critical", icon: AlertCircle, link: "/billing" },
    { title: "Pending Invoices", desc: `${pendingInvoicesCount} invoices require follow-up`, type: "warning", icon: FileText, link: "/quotations" },
    { title: "New Orders", desc: "3 new orders from distributors", type: "info", icon: CheckCircle2, link: "/projects" },
    { title: "Projects Awaiting Approval", desc: "PRJ-015 requires your sign-off", type: "warning", icon: Clock, link: "/projects" }
  ];

  // 2. Quick Summary
  const activeProjectsCount = projects.filter(p => p.status === 'active').length;
  const totalRevenue = 1450000;
  const totalExpenses = 850000;
  const quotationsCount = 24;

  // 4. Projects List
  const recentProjects = projects.slice(0, 4);

  // 6. Accounts Snapshot
  const outstanding = 350000;
  const paid = 1100000;
  const profit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 2. Quick Summary */}
      <section>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <MetricCard label="Revenue (This Month)" value={`₹${(totalRevenue/100000).toFixed(1)}L`} icon={TrendingUp} trend={{ value: 12.5, label: "vs last mo" }} />
          <MetricCard label="Expenses (This Month)" value={`₹${(totalExpenses/100000).toFixed(1)}L`} icon={TrendingDown} trend={{ value: -2.4, label: "vs last mo" }} />
          <MetricCard label="Active Projects" value={activeProjectsCount} icon={CheckCircle2} />
          <MetricCard label="Quotations" value={quotationsCount} icon={FileText} trend={{ value: 5.2, label: "vs last mo" }} />
        </div>
      </section>

      {/* 1. Action Required */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold tracking-tight">Action Required</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actionItems.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => navigate(item.link)}
              className="flex items-center justify-between p-3 rounded-xl border bg-card shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${item.type === 'critical' ? 'bg-destructive/10 text-destructive' : item.type === 'warning' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium leading-none">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Primary Actions (2x2 Grid) */}
      <section>
        <h2 className="text-base font-semibold tracking-tight mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-3 rounded-xl border-dashed bg-card hover:bg-accent hover:border-primary shadow-sm active:scale-95 transition-all">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">New Quotation</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-3 rounded-xl border-dashed bg-card hover:bg-accent hover:border-primary shadow-sm active:scale-95 transition-all">
            <Ruler className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Add Measurement</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-3 rounded-xl border-dashed bg-card hover:bg-accent hover:border-primary shadow-sm active:scale-95 transition-all">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Run Optimization</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-3 rounded-xl border-dashed bg-card hover:bg-accent hover:border-primary shadow-sm active:scale-95 transition-all">
            <FolderPlus className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Create Project</span>
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5. Projects List */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold tracking-tight">Active Projects</h2>
            <Button variant="ghost" size="sm" className="text-xs text-primary h-8 px-2" onClick={() => navigate("/projects")}>View All</Button>
          </div>
          <div className="space-y-3">
            {recentProjects.map((prj) => (
              <div key={prj.id} className="p-4 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-semibold pr-2">{prj.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{prj.client}</p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center">
                    <StatusBadge status={prj.status} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Updated just now</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary font-medium cursor-pointer hover:underline">
                    <span>Next: Optimization</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          {/* 7. Accounts Snapshot */}
          <section>
            <h2 className="text-base font-semibold tracking-tight mb-3">Accounts Overview</h2>
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x border rounded-xl bg-card shadow-sm">
              <div className="flex-1 text-center p-4">
                <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
                <p className="text-lg font-semibold text-warning">₹{(outstanding/100000).toFixed(1)}L</p>
              </div>
              <div className="flex-1 text-center p-4">
                <p className="text-xs text-muted-foreground mb-1">Paid</p>
                <p className="text-lg font-semibold text-success">₹{(paid/100000).toFixed(1)}L</p>
              </div>
              <div className="flex-1 text-center p-4 bg-primary/5">
                <p className="text-xs text-primary/70 mb-1">Profit</p>
                <p className="text-lg font-semibold text-primary">₹{(profit/100000).toFixed(1)}L</p>
              </div>
            </div>
          </section>

          {/* 6. Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold tracking-tight">Recent Activity</h2>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <ActivityTimeline items={activityLog.slice(0, 5)} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

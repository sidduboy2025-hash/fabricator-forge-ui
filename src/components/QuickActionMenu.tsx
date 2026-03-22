import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FolderPlus, Ruler, FileText, Zap, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActionMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { title: "Create Project", icon: FolderPlus, color: "text-primary", bg: "bg-primary/10", route: "/projects" },
    { title: "Add Measurement", icon: Ruler, color: "text-info", bg: "bg-info/10", route: "#" },
    { title: "New Quotation", icon: FileText, color: "text-success", bg: "bg-success/10", route: "/quotations" },
    { title: "Run Optimization", icon: Zap, color: "text-warning", bg: "bg-warning/10", route: "/batch" },
    { title: "Create Order", icon: ShoppingCart, color: "text-destructive", bg: "bg-destructive/10", route: "#" },
  ];

  const handleAction = (route: string) => {
    setOpen(false);
    if (route !== "#") {
      navigate(route);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      {/* max-w-[340px] creates a nice tight grid, align-bottom on mobile */}
      <DialogContent className="max-w-[360px] p-6 sm:max-w-md rounded-2xl mx-auto top-[50%] sm:top-[50%] translate-y-[-50%]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold">Quick Actions</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, idx) => (
            <div
              key={idx}
              onClick={() => handleAction(action.route)}
              className="group flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-border/60 bg-card hover:bg-accent hover:border-primary/50 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <div className={`p-3 rounded-full ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                <action.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-center leading-tight">{action.title}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

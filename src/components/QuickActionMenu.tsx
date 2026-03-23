import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FolderPlus, Ruler, FileText, Zap, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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
      <DialogContent className="max-w-[360px] p-6 sm:max-w-md rounded-2xl mx-auto top-[50%] sm:top-[50%] translate-y-[-50%] overflow-hidden border-none bg-background/80 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Quick Actions
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in duration-300">
          {actions.map((action, idx) => (
            <div
              key={idx}
              onClick={() => handleAction(action.route)}
              className={cn(
                "group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border bg-card/50",
                "hover:bg-accent hover:border-primary/50 transition-all cursor-pointer shadow-sm active:scale-95",
                "backdrop-blur-sm"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                action.bg, action.color
              )}>
                <action.icon className="h-7 w-7" />
              </div>
              <span className="text-xs font-bold tracking-tight text-center leading-tight uppercase opacity-80 group-hover:opacity-100 italic">
                {action.title}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

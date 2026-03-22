import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface TimelineItem {
  id: string;
  action: string;
  user: string;
  module: string;
  timestamp: string;
  details?: string;
}

interface ActivityTimelineProps {
  items: TimelineItem[];
  className?: string;
}

const moduleColors: Record<string, string> = {
  Projects: "bg-primary",
  Payments: "bg-success",
  Inventory: "bg-warning",
  OCR: "bg-info",
  Pricing: "bg-primary",
  Billing: "bg-success",
  "Supply Chain": "bg-destructive",
  Batch: "bg-info",
  Reports: "bg-muted-foreground",
};

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-3 py-2.5">
          <div className="flex flex-col items-center">
            <div className={cn("h-2 w-2 rounded-full mt-1.5", moduleColors[item.module] || "bg-muted-foreground")} />
            {index < items.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-foreground">{item.action}</span>
              <span className="text-2xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.user} · {item.module}
            </p>
            {item.details && (
              <p className="text-xs text-muted-foreground/80 mt-0.5 truncate">{item.details}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

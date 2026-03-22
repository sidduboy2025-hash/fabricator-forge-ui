import { cn } from "@/lib/utils";

type StatusType =
  | "active" | "completed" | "pending" | "error" | "overdue"
  | "low-stock" | "in-stock" | "out-of-stock"
  | "paid" | "draft" | "on-hold"
  | "synced" | "processing" | "validated" | "errors"
  | "inactive";

const statusStyles: Record<StatusType, string> = {
  active: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  error: "bg-destructive/10 text-destructive",
  errors: "bg-destructive/10 text-destructive",
  overdue: "bg-destructive/10 text-destructive",
  "low-stock": "bg-warning/10 text-warning",
  "in-stock": "bg-success/10 text-success",
  "out-of-stock": "bg-destructive/10 text-destructive",
  paid: "bg-success/10 text-success",
  draft: "bg-muted text-muted-foreground",
  "on-hold": "bg-muted text-muted-foreground",
  synced: "bg-success/10 text-success",
  processing: "bg-info/10 text-info",
  validated: "bg-success/10 text-success",
  inactive: "bg-muted text-muted-foreground",
};

const statusLabels: Record<StatusType, string> = {
  active: "Active",
  completed: "Completed",
  pending: "Pending",
  error: "Error",
  errors: "Errors",
  overdue: "Overdue",
  "low-stock": "Low Stock",
  "in-stock": "In Stock",
  "out-of-stock": "Out of Stock",
  paid: "Paid",
  draft: "Draft",
  "on-hold": "On Hold",
  synced: "Synced",
  processing: "Processing",
  validated: "Validated",
  inactive: "Inactive",
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        statusStyles[status] || "bg-muted text-muted-foreground",
        className
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}

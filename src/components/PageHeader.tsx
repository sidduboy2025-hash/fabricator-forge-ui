import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: Array<{
    label: string;
    icon?: LucideIcon;
    variant?: "default" | "outline" | "secondary" | "ghost";
    onClick?: () => void;
  }>;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, actions, className, children }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h1 className="text-xl font-semibold leading-tight">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="mt-3 flex items-center gap-2 sm:mt-0">
        {actions?.map((action, i) => (
          <Button
            key={i}
            variant={action.variant || "default"}
            size="sm"
            onClick={action.onClick}
            className="active:scale-[0.97] transition-transform"
          >
            {action.icon && <action.icon className="mr-1.5 h-3.5 w-3.5" />}
            {action.label}
          </Button>
        ))}
        {children}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  label: string;
  description?: string;
}

interface StepperIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepperIndicator({ steps, currentStep, className }: StepperIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-0", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
                index < currentStep
                  ? "bg-success text-success-foreground"
                  : index === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {index < currentStep ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </div>
            <span className={cn(
              "mt-1.5 text-2xs font-medium whitespace-nowrap",
              index <= currentStep ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              "mx-2 h-px w-10 sm:w-16",
              index < currentStep ? "bg-success" : "bg-border"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

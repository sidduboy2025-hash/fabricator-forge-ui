import { Plus } from "lucide-react";
import { QuickActionMenu } from "./QuickActionMenu";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function QuickActionFAB() {
  return (
    <div className="fixed bottom-6 right-6 z-[60] sm:bottom-8 sm:right-8">
      <QuickActionMenu>
        <Button 
          size="icon" 
          className={cn(
            "h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl bg-primary hover:bg-primary/90",
            "transition-all duration-300 hover:scale-110 active:scale-95 group border-4 border-background"
          )}
        >
          <div className="relative flex items-center justify-center">
            <Plus className="h-7 w-7 sm:h-8 sm:w-8 text-primary-foreground group-hover:rotate-90 transition-transform duration-300" />
          </div>
        </Button>
      </QuickActionMenu>
    </div>
  );
}

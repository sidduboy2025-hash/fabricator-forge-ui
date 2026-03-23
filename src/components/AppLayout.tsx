import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { QuickActionFAB } from "@/components/QuickActionFAB";
import { useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  if (isHomePage) {
    return (
      <div className="min-h-screen flex w-full overflow-hidden bg-background">
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-hidden relative">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto p-4 sm:p-6 pb-24 sm:pb-6">
            {children}
          </main>
        </div>
        <QuickActionFAB />
      </div>
    </SidebarProvider>
  );
}

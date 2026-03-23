import {
  LayoutDashboard,
  FolderKanban,
  Package,
  Calculator,
  Wallet,
  CreditCard,
  Network,
  ScanLine,
  FileText,
  Layers,
  ShieldCheck,
  PlusCircle,
  Scissors
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { QuickActionMenu } from "@/components/QuickActionMenu";

import { useRole, Role } from "@/contexts/RoleContext";

const getNavGroups = (role: Role) => [
  {
    label: "Main Navigation",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Projects", url: "/projects", icon: FolderKanban },
      { title: "Action", url: "/new-action", icon: PlusCircle },
      { title: "Quotations", url: "/quotations", icon: FileText },
      { title: "Accounts", url: "/billing", icon: Wallet },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Inventory", url: "/inventory", icon: Package },
      ...(role === "FABRICATOR" ? [{ title: "Cutting Optimizer", url: "/optimization", icon: Scissors }] : []),
      ...(role === "DISTRIBUTOR" || role === "ADMIN" ? [{ title: "Fabricators", url: "/fabricators", icon: Network }] : []),
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Pricing Engine", url: "/pricing", icon: Calculator },
      { title: "Payments", url: "/payments", icon: CreditCard },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { title: "OCR / AI Input", url: "/ocr", icon: ScanLine },
      { title: "Reports", url: "/reports", icon: FileText },
      { title: "Batch Processing", url: "/batch", icon: Layers },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Supply Chain", url: "/supply-chain", icon: Network },
      { title: "Admin Panel", url: "/admin", icon: ShieldCheck },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { role } = useRole();
  const navGroups = getNavGroups(role);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className={cn("flex h-12 items-center border-b border-sidebar-border px-4", collapsed && "justify-center px-2")}>
        {!collapsed ? (
          <span className="text-sm font-semibold tracking-tight text-foreground">Fabricator</span>
        ) : (
          <span className="text-sm font-bold text-primary">F</span>
        )}
      </div>

      <SidebarContent className="py-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-2xs uppercase tracking-widest text-muted-foreground/60 px-4 mb-0.5">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = item.url === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(item.url);
                  
                  if (item.title === "Action") {
                    return (
                      <QuickActionMenu key={item.title}>
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild>
                            <button
                              className={cn(
                                "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors w-full cursor-pointer",
                                "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              )}
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                              {!collapsed && <span>{item.title}</span>}
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </QuickActionMenu>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/dashboard"}
                          className={cn(
                            "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-success" />
            <span>All systems online</span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

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
  Settings,
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

const navGroups = [
  {
    label: "Operations",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Projects", url: "/projects", icon: FolderKanban },
      { title: "Inventory", url: "/inventory", icon: Package },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Pricing Engine", url: "/pricing", icon: Calculator },
      { title: "Billing & Wallet", url: "/billing", icon: Wallet },
      { title: "Payments", url: "/payments", icon: CreditCard },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { title: "OCR Uploads", url: "/ocr", icon: ScanLine },
      { title: "Reports", url: "/reports", icon: FileText },
      { title: "Batch Processing", url: "/batch", icon: Layers },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Supply Chain", url: "/supply-chain", icon: Network },
      { title: "Admin Panel", url: "/admin", icon: ShieldCheck },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

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
                  const isActive = item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/"}
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

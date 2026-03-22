import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, Globe, Search, User, Wallet } from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { walletBalance } from "@/data/wallet";

const orgs = [
  { id: "1", name: "Acme Fabricators", role: "Owner" },
  { id: "2", name: "Southern Glass Works", role: "Admin" },
  { id: "3", name: "Metro Aluminium Fab", role: "Viewer" },
];

const notifications = [
  { id: "1", text: "INV-2026-005 is overdue — Vertex Infra Pvt Ltd", time: "2h ago", unread: true },
  { id: "2", text: "Stock alert: Corner Profile 90° is out of stock", time: "4h ago", unread: true },
  { id: "3", text: "PRJ-014 processing completed — 3,900 SFT", time: "5h ago", unread: true },
  { id: "4", text: "OCR extraction completed for airport-t3-section-a.pdf", time: "6h ago", unread: false },
  { id: "5", text: "Payment received: ₹1,73,460 from DPS Society", time: "1d ago", unread: false },
];

export function AppHeader() {
  const [currentOrg, setCurrentOrg] = useState(orgs[0]);
  const [currentLang, setCurrentLang] = useState("EN");
  const [isOffline] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="flex h-12 items-center justify-between border-b bg-card px-3 gap-3">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-7 w-7" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs font-medium">
              {currentOrg.name}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-xs">Switch Organization</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {orgs.map((org) => (
              <DropdownMenuItem key={org.id} onClick={() => setCurrentOrg(org)} className="text-xs">
                <div className="flex flex-col">
                  <span>{org.name}</span>
                  <span className="text-2xs text-muted-foreground">{org.role}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative hidden max-w-xs flex-1 sm:block">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search projects, invoices, inventory..." className="h-7 pl-8 text-xs" />
      </div>

      <div className="flex items-center gap-1">
        {/* Offline indicator */}
        <div className="flex items-center gap-1 mr-1">
          <div className={`h-1.5 w-1.5 rounded-full ${isOffline ? "bg-destructive" : "bg-success"}`} />
          {isOffline && <span className="text-2xs text-destructive">Offline</span>}
        </div>

        {/* Language */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Globe className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {["EN", "తెలుగు", "हिंदी"].map((lang) => (
              <DropdownMenuItem key={lang} onClick={() => setCurrentLang(lang)} className="text-xs">
                {lang} {currentLang === lang && "✓"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Wallet */}
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs font-medium">
          <Wallet className="h-3.5 w-3.5" />
          <CurrencyDisplay amount={walletBalance} compact />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 relative">
              <Bell className="h-3.5 w-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="text-xs">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start py-2">
                <div className="flex items-start gap-2 w-full">
                  {n.unread && <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-snug">{n.text}</p>
                    <p className="text-2xs text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                RK
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="text-sm font-medium">Ravi Kumar</div>
              <div className="text-2xs text-muted-foreground">ravi@acmefab.com</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-destructive">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

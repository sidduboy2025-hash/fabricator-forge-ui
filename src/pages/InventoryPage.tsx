import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { MetricCard } from "@/components/MetricCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { inventory, InventoryItem, stockOperationsLog, StockOperation, stockAlerts } from "@/data/inventory";
import { StockOperationDialog } from "@/components/StockOperationDialog";
import { Plus, Package, GlassWater, Wrench, Activity, AlertTriangle, LayoutList } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const itemColumns: Column<InventoryItem>[] = [
  { key: "id", label: "ID", sortable: true, className: "font-mono text-xs w-24" },
  { key: "itemName", label: "Item Name", sortable: true, render: (r) => <span className="font-medium">{r.itemName}</span> },
  { key: "category", label: "Category", sortable: true, render: (r) => <span className="capitalize">{r.category}</span> },
  { key: "quantity", label: "Qty", sortable: true, render: (r) => <span className="tabular-nums">{r.quantity.toLocaleString()}</span> },
  { key: "unit", label: "Unit" },
  { key: "location", label: "Location", sortable: true },
  { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
];

const opsColumns: Column<StockOperation>[] = [
  { key: "id", label: "ID", sortable: true, className: "font-mono text-xs w-24" },
  { key: "type", label: "Operation", sortable: true, render: (r) => (
    <span className={`text-xs font-medium capitalize ${r.type === 'in' ? 'text-success' : r.type === 'bom-deduction' ? 'text-primary' : 'text-warning'}`}>
      {r.type.replace("-", " ")}
    </span>
  )},
  { key: "itemName", label: "Item", sortable: true, render: (r) => <span className="font-medium">{r.itemName}</span> },
  { key: "quantity", label: "Qty", sortable: true, render: (r) => (
    <span className={`tabular-nums font-medium ${r.quantity > 0 ? "text-success" : "text-destructive"}`}>
      {r.quantity > 0 ? "+" : ""}{r.quantity}
    </span>
  )},
  { key: "reference", label: "Ref / BOM", render: (r) => <span className="text-xs text-muted-foreground font-mono">{r.reference || "—"}</span> },
  { key: "date", label: "Date", sortable: true, render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.date).toLocaleString("en-IN")}</span> },
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("tracking");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const profiles = inventory.filter((i) => i.category === "profiles");
  const glass = inventory.filter((i) => i.category === "glass");
  const hardware = inventory.filter((i) => i.category === "hardware");

  // Multi-level visibility filtering
  const filteredInventory = inventory.filter(item => {
    const matchCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchLocation = locationFilter === "all" || item.location === locationFilter;
    return matchCategory && matchLocation;
  });

  const uniqueLocations = Array.from(new Set(inventory.map(i => i.location)));
  
  const lowStockItems = inventory.filter(i => i.status === 'low-stock' || i.status === 'out-of-stock');

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Inventory Management"
        description="Track stock levels, log operations, and monitor BOM auto-deductions"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-background border border-border">
          <TabsTrigger value="tracking" className="gap-2"><LayoutList className="h-4 w-4" /> Stock Tracking</TabsTrigger>
          <TabsTrigger value="operations" className="gap-2"><Activity className="h-4 w-4" /> Stock Operations</TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2"><AlertTriangle className="h-4 w-4" /> Alerts & Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard label="Profiles" value={`${profiles.length} items`} icon={Package} trend={{ value: -2, label: "low stock items" }} />
            <MetricCard label="Glass" value={`${glass.length} items`} icon={GlassWater} />
            <MetricCard label="Hardware" value={`${hardware.length} items`} icon={Wrench} trend={{ value: -4, label: "items need restock" }} />
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-medium">Master Inventory</h3>
              
              <div className="flex items-center gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="profiles">Profiles</SelectItem>
                    <SelectItem value="glass">Glass</SelectItem>
                    <SelectItem value="hardware">Hardware</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DataTable columns={itemColumns} data={filteredInventory} selectable searchPlaceholder="Search inventory by Name or ID..." />
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium">Operations Ledger</h3>
              <p className="text-sm text-muted-foreground mt-1">Track manual movements and automated BOM deductions from projects.</p>
            </div>
            <StockOperationDialog>
              <Button variant="default"><Plus className="mr-2 h-4 w-4" /> Log Movement</Button>
            </StockOperationDialog>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/20 text-success"><Activity className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-medium">Total Stock In</p>
                <p className="text-2xl font-bold">1,500</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning/20 text-warning"><Activity className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-medium">Manual Stock Out</p>
                <p className="text-2xl font-bold">45</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20 text-primary"><Package className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-medium">Auto-deducted via BOM</p>
                <p className="text-2xl font-bold">159</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <DataTable columns={opsColumns} data={stockOperationsLog} searchPlaceholder="Search operations log by Item, Reference, etc..." />
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 space-y-6">
              <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-5">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-bold">Critical Action Requires</h3>
                </div>
                <p className="text-sm text-foreground/80 mb-4">You have {lowStockItems.length} items that are either low or completely out of stock. Immediate replenishment is advised to avoid production delays.</p>
                
                <div className="space-y-2">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm p-2 rounded bg-background/50 border border-border/50">
                      <span className="font-medium truncate max-w-[150px]" title={item.itemName}>{item.itemName}</span>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-1">Stock Depletion Trends</h3>
              <p className="text-sm text-muted-foreground mb-6">Historical view of low stock and out-of-stock events over the last 6 months.</p>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockAlerts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <RechartsTooltip 
                      cursor={{ fill: '#2a2a2a' }}
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="lowStockEvents" name="Low Stock Events" stackId="a" fill="#eab308" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="outOfStockEvents" name="Out of Stock Events" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

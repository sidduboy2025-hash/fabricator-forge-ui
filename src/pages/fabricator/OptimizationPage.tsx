import React, { useState, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Settings2, Calculator, Save, Layers, ScissorsLineDashed } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Helper function to format window name for Purchase Order
const formatWindowNameForPO = (name: string) => {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length > 1 && !isNaN(Number(parts[parts.length - 1]))) {
    return `${parts[0][0]}${parts[parts.length - 1]}`;
  }
  return name;
};

// Window Graphic Component
const WindowDisplay = ({ width, height, numTracks }: { width: number | "", height: number | "", numTracks: number }) => {
  const maxWidth = 180;
  const maxHeight = 120;
  let dispW = 0, dispH = 0;

  if (width && height) {
    const ar = width / height;
    if (width > height) {
      dispW = maxWidth;
      dispH = maxWidth / ar;
      if (dispH > maxHeight) { dispH = maxHeight; dispW = maxHeight * ar; }
    } else {
      dispH = maxHeight;
      dispW = maxHeight * ar;
      if (dispW > maxWidth) { dispW = maxWidth; dispH = maxWidth / ar; }
    }
  }

  const numSashes = (numTracks === 2 || numTracks === 2.5) ? 2 : 3;
  const sashPct = 100 / numSashes;

  return (
    <div className="flex items-center justify-center bg-card border rounded-lg p-6 relative w-full h-[160px] mx-auto shadow-inner">
      {width && height ? (
        <div className="relative flex border-2 border-primary bg-accent" style={{ width: dispW, height: dispH }}>
          {Array.from({ length: numSashes }).map((_, i) => (
            <div key={i} className="relative h-full border-r border-border last:border-r-0" style={{ width: `${sashPct}%` }}>
              <div className={`absolute inset-1 flex items-center justify-center text-[9px] font-medium rounded-sm ${((numTracks === 2.5 || numTracks === 3.5) && i === numSashes - 1) ? "bg-success/20 text-success" : "bg-primary/20 text-primary"}`}>
                {((numTracks === 2.5 || numTracks === 3.5) && i === numSashes - 1) ? "Scr" : "Gls"}
              </div>
            </div>
          ))}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground">{width}mm</div>
          <div className="absolute top-1/2 -right-10 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">{height}mm</div>
        </div>
      ) : <span className="text-muted-foreground text-xs font-medium">Enter W & H</span>}
    </div>
  );
};

export default function OptimizationPage() {
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Constants
  const trackOptionsMap: Record<string, { label: string; value: number; fullSeriesName: string }[]> = {
    "Slider Eco Window": [
      { label: "2 Tracks", value: 2, fullSeriesName: "Eco 2 Track" },
      { label: "2.5 Tracks", value: 2.5, fullSeriesName: "Eco 2.5 Track" }
    ],
    "Slider Standard Window": [
      { label: "2 Tracks", value: 2, fullSeriesName: "Slider Standard Window 2 Track" },
      { label: "2.5 Tracks", value: 2.5, fullSeriesName: "Slider Standard Window 2.5 Track" },
      { label: "3 Tracks", value: 3, fullSeriesName: "Slider Standard Window 3 Track" }
    ],
    "Slider Premium Window": [
      { label: "2 Tracks", value: 2, fullSeriesName: "Slider Premium Window 2 Track" },
      { label: "3 Tracks", value: 3, fullSeriesName: "Slider Premium Window 3 Track" }
    ]
  };

  // State
  const [windows, setWindows] = useState([
    { id: 1, name: "Window 1", width: "" as number | "", height: "" as number | "", numTracks: 2, quantity: 1, topLevelSeries: "Slider Eco Window", selectedFullSeriesName: "Eco 2 Track", glassType: "5mm Clear Glass", hardwareType: "Standard" }
  ]);

  const [appSettings, setAppSettings] = useState({
    kerfThickness: 15,
    weldingThickness: 2.5,
    edgeTrimThickness: 10,
    useCommonStockLength: false,
    commonStockLength: 5900,
    stockLengths: { "frame 55 outer": 5900, "sash 57x34": 5900, "interlock 80": 5900, "beed 80": 5900, "screen 50x24": 5900 } as Record<string, number>,
    profileDimensions: { "frame 55 outer": { height: 50 }, "sash 57x34": { height: 57 } } as Record<string, any>,
    hardwareSettings: { "Standard": { cost: 500 }, "Premium": { cost: 1200 } } as Record<string, any>,
    seriesDeductions: {
      "Eco 2 Track": { frameProfile: "frame 55 outer", sashProfile: "sash 57x34", interlockProfile: "interlock 80", beadingProfile: "beed 80", screenProfile: "screen 50x24", glassSash: { widthDeduction: 10, sashHeightAdjustment: 10 }, beading: { heightDeduction: 20, widthDeduction: 20 }, interlockHeightDeduction: 80 },
      "Eco 2.5 Track": { frameProfile: "frame 80 outer", sashProfile: "sash 57x34", interlockProfile: "interlock 80", beadingProfile: "beed 80", screenProfile: "screen 50x24", glassSash: { widthDeduction: 10, sashHeightAdjustment: 10 }, screenSash: { heightDeduction: 100, widthDeduction: 15 }, beading: { heightDeduction: 20, widthDeduction: 20 }, interlockHeightDeduction: 100 },
      "Slider Standard Window 2 Track": { frameProfile: "frame 55 outer", sashProfile: "sash 57x34", interlockProfile: "interlock 80", beadingProfile: "beed 80", screenProfile: "screen 50x24", glassSash: { widthDeduction: 10, sashHeightAdjustment: 10 }, beading: { heightDeduction: 20, widthDeduction: 20 }, interlockHeightDeduction: 80 },
      "Slider Standard Window 2.5 Track": { frameProfile: "frame 80 outer", sashProfile: "sash 57x34", interlockProfile: "interlock 80", beadingProfile: "beed 80", screenProfile: "screen 50x24", glassSash: { widthDeduction: 10, sashHeightAdjustment: 10 }, screenSash: { heightDeduction: 100, widthDeduction: 15 }, beading: { heightDeduction: 20, widthDeduction: 20 }, interlockHeightDeduction: 100 },
      "Slider Standard Window 3 Track": { frameProfile: "frame 80 outer", sashProfile: "sash 57x34", interlockProfile: "interlock 80", beadingProfile: "beed 80", screenProfile: "screen 50x24", glassSash: { widthDeduction: 10, sashHeightAdjustment: 10 }, beading: { heightDeduction: 20, widthDeduction: 20 }, interlockHeightDeduction: 100 },
      "Slider Premium Window 2 Track": { frameProfile: "frame 55 outer", sashProfile: "sash 57x34", interlockProfile: "interlock 80", beadingProfile: "beed 80", screenProfile: "screen 50x24", glassSash: { widthDeduction: 10, sashHeightAdjustment: 10 }, beading: { heightDeduction: 20, widthDeduction: 20 }, interlockHeightDeduction: 80 },
      "Slider Premium Window 3 Track": { frameProfile: "frame 80 outer", sashProfile: "sash 57x34", interlockProfile: "interlock 80", beadingProfile: "beed 80", screenProfile: "screen 50x24", glassSash: { widthDeduction: 10, sashHeightAdjustment: 10 }, beading: { heightDeduction: 20, widthDeduction: 20 }, interlockHeightDeduction: 100 },
    } as Record<string, any>
  });

  const [combinedCuttingPlan, setCombinedCuttingPlan] = useState<Record<string, any[]>>({});
  const [totalAreaSqMeters, setTotalAreaSqMeters] = useState(0);
  const [totalHardwareCost, setTotalHardwareCost] = useState(0);

  // Handlers
  const updateWindow = (id: number, field: string, value: any) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      const updated = { ...w, [field]: value };
      if (field === "topLevelSeries") {
        const options = trackOptionsMap[value as string] || [];
        updated.numTracks = options[0]?.value || 2;
        updated.selectedFullSeriesName = options[0]?.fullSeriesName || "";
      } else if (field === "numTracks") {
        const opt = trackOptionsMap[w.topLevelSeries]?.find(o => o.value === parseFloat(value));
        if (opt) updated.selectedFullSeriesName = opt.fullSeriesName;
      }
      return updated;
    }));
    setShowResults(false);
  };

  const updateSetting = (key: string, value: any) => {
    setAppSettings(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
    setShowResults(false);
  };

  const addWindow = () => {
    setWindows(prev => [...prev, { ...prev[prev.length - 1], id: Date.now(), name: `Window ${prev.length + 1}` }]);
    setShowResults(false);
  };

  const removeWindow = (id: number) => {
    if (windows.length > 1) setWindows(prev => prev.filter(w => w.id !== id));
    setShowResults(false);
  };

  // Algorithm
  const calculateAllParts = useCallback(() => {
    let tempArea = 0, tempHwCost = 0, tempAllParts: any[] = [];
    
    windows.forEach(w => {
      const width = parseFloat(w.width as string);
      const height = parseFloat(w.height as string);
      const qty = parseInt(w.quantity as any) || 1;
      const deds = appSettings.seriesDeductions[w.selectedFullSeriesName];
      
      if (!width || !height || !deds) return;

      tempArea += (width * height * qty);
      tempHwCost += (appSettings.hardwareSettings[w.hardwareType]?.cost || 0) * qty;

      const welding = appSettings.weldingThickness;
      const parts = [
        { type: "Frame H", len: width + (2 * welding), prof: deds.frameProfile, count: 2 },
        { type: "Frame V", len: height + (2 * welding), prof: deds.frameProfile, count: 2 }
      ];

      const sashes = (w.numTracks >= 3) ? 3 : 2;
      const fH = appSettings.profileDimensions[deds.frameProfile]?.height || 50;
      const sH = height - (fH * 2) + (deds.glassSash?.sashHeightAdjustment || 0);
      const sW = (width / sashes) - (deds.glassSash?.widthDeduction || 0);

      for (let i = 0; i < sashes; i++) {
        parts.push({ type: "Sash V", len: sH, prof: deds.sashProfile, count: 2 });
        parts.push({ type: "Sash H", len: sW, prof: deds.sashProfile, count: 2 });
      }

      parts.forEach(p => {
        for (let i = 0; i < p.count * qty; i++) {
          tempAllParts.push({ ...p, windowName: w.name });
        }
      });
    });

    const plan: Record<string, any[]> = {};
    tempAllParts.forEach(p => {
      if (!plan[p.prof]) plan[p.prof] = [];
      let stock = plan[p.prof].find(s => s.rem >= (p.len + appSettings.kerfThickness));
      
      if (!stock) {
        const l = appSettings.useCommonStockLength ? appSettings.commonStockLength : (appSettings.stockLengths[p.prof] || 5900);
        stock = { id: plan[p.prof].length + 1, orig: l, rem: l - appSettings.edgeTrimThickness, cuts: [] };
        plan[p.prof].push(stock);
      }
      
      stock.cuts.push(p);
      stock.rem -= (p.len + appSettings.kerfThickness);
    });

    setTotalAreaSqMeters(tempArea / 1000000);
    setTotalHardwareCost(tempHwCost);
    setCombinedCuttingPlan(plan);
    setShowResults(true);
    
    toast({
      title: "Optimization Complete",
      description: `Calculated requirements for ${tempArea > 0 ? (tempArea / 1000000).toFixed(2) : 0} m² of material.`,
    });
  }, [windows, appSettings, toast]);

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      <PageHeader 
        title="Cutting Optimizer" 
        description="Linear 1D bin-packing engine for aluminium profiles"
        actions={[
          { label: "Settings", icon: Settings2, onClick: () => setShowSettings(true) }
        ]}
      />

      <Card className="shadow-sm border-border">
        <CardHeader className="flex flex-row items-center justify-between bg-card rounded-t-xl border-b pb-4">
          <div>
            <CardTitle className="text-lg">Measurements</CardTitle>
            <CardDescription>Input your scheduled window spans.</CardDescription>
          </div>
          <Button onClick={addWindow} variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Window
          </Button>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border">
          {windows.map((w, index) => (
            <div key={w.id} className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">Window {index + 1}</h4>
                  {windows.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeWindow(w.id)} className="text-destructive h-8 px-2 hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Width (mm)</Label>
                    <Input type="number" value={w.width} onChange={e => updateWindow(w.id, "width", e.target.value)} placeholder="e.g. 1200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Height (mm)</Label>
                    <Input type="number" value={w.height} onChange={e => updateWindow(w.id, "height", e.target.value)} placeholder="e.g. 1500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Qty</Label>
                    <Input type="number" value={w.quantity} onChange={e => updateWindow(w.id, "quantity", e.target.value)} min={1} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Hardware</Label>
                    <Select value={w.hardwareType} onValueChange={val => updateWindow(w.id, "hardwareType", val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Series Line</Label>
                    <Select value={w.topLevelSeries} onValueChange={val => updateWindow(w.id, "topLevelSeries", val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.keys(trackOptionsMap).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Track Type</Label>
                    <Select value={w.numTracks.toString()} onValueChange={val => updateWindow(w.id, "numTracks", val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {trackOptionsMap[w.topLevelSeries]?.map(t => <SelectItem key={t.value} value={t.value.toString()}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <WindowDisplay width={w.width} height={w.height} numTracks={w.numTracks} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={calculateAllParts} size="lg" className="w-full text-base font-bold shadow-lg h-14 bg-primary hover:bg-primary/90">
        <Calculator className="mr-2 h-5 w-5" /> Calculate Optimization Layout
      </Button>

      {showResults && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-primary text-primary-foreground border-transparent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-80 uppercase tracking-wider mb-1">Total Project Area</p>
                    <p className="text-3xl font-black">{totalAreaSqMeters.toFixed(2)} <span className="text-xl">m²</span></p>
                  </div>
                  <Layers className="h-10 w-10 opacity-30" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-success text-success-foreground border-transparent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-80 uppercase tracking-wider mb-1">Hardware Const.</p>
                    <p className="text-3xl font-black">₹{totalHardwareCost.toLocaleString()}</p>
                  </div>
                  <Settings2 className="h-10 w-10 opacity-30" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold tracking-tight">Cut Sheet Render</h3>
            
            {Object.entries(combinedCuttingPlan).map(([profile, stocks]) => (
              <Card key={profile} className="shadow-sm border-border overflow-hidden">
                <div className="bg-accent/40 border-b p-4 flex justify-between items-center">
                  <h4 className="font-semibold uppercase tracking-wider text-sm text-foreground/80 flex items-center gap-2">
                    <ScissorsLineDashed className="h-4 w-4" /> {profile}
                  </h4>
                  <span className="text-sm font-medium border px-3 py-1 rounded-full bg-background">{stocks.length} Stock Bar(s)</span>
                </div>
                <CardContent className="p-4 space-y-6 bg-card/50">
                  {stocks.map(s => {
                    const usedPct = ((s.orig - s.rem) / s.orig) * 100;
                    return (
                      <div key={s.id} className="space-y-3">
                        <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <span>Bar #{s.id} — {s.orig}mm</span>
                          <span className={s.rem > 300 ? "text-success" : "text-warning"}>Tail: {s.rem.toFixed(1)}mm</span>
                        </div>
                        
                        {/* Visual Bar rendered roughly */}
                        <div className="h-8 w-full bg-border/40 rounded-sm overflow-hidden flex ring-1 ring-border/50 ring-inset">
                          {s.cuts.map((c: any, i: number) => {
                            const cutPct = (c.len / s.orig) * 100;
                            return (
                              <div 
                                key={i} 
                                className="h-full border-r border-background bg-primary/20 flex flex-col justify-center items-center relative group min-w-[20px]"
                                style={{ width: `${cutPct}%` }}
                              >
                                <span className="text-[10px] font-bold text-primary/80 truncate px-1 max-w-full group-hover:block hidden absolute -top-8 bg-background shadow border p-1 rounded z-10 whitespace-nowrap">
                                  {c.type}: {c.len}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pt-1">
                          {s.cuts.map((c: any, i: number) => (
                            <div key={i} className="bg-background border px-2 py-1 rounded text-xs shadow-sm font-medium">
                              <span className="text-muted-foreground mr-1">{c.type}:</span>
                              <span className="text-foreground">{c.len}mm</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Optimization Parameters</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="kerf" className="col-span-3 text-sm font-medium text-foreground/80">Kerf Thickness (mm)</Label>
              <Input id="kerf" type="number" value={appSettings.kerfThickness} onChange={e => updateSetting("kerfThickness", e.target.value)} className="col-span-1" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="welding" className="col-span-3 text-sm font-medium text-foreground/80">Welding Allowance (mm)</Label>
              <Input id="welding" type="number" value={appSettings.weldingThickness} onChange={e => updateSetting("weldingThickness", e.target.value)} className="col-span-1" />
            </div>
            <div className="bg-warning/20 border border-warning/30 p-4 rounded-xl mt-2 text-warning font-medium text-xs">
              System variables including dimension constraints and margin allocations are sourced actively under the hood based on your tenant configuration.
            </div>
          </div>
          <Button onClick={() => setShowSettings(false)} className="w-full">
            <Save className="mr-2 h-4 w-4" /> Save Preferences
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

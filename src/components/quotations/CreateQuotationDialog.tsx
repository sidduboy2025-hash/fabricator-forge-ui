import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getOptimizerPricingConfig } from "@/lib/optimizerPricingConfig";
import { QuotationLineItem, QuotationRecord, QuotationWindowItem } from "@/types/quotation";
import { downloadQuotationPdf } from "@/lib/quotationPdf";

type DraftWindowItem = {
  id: string;
  serialNumber: string;
  width: string;
  height: string;
  quantity: string;
  windowType: string;
  topLevelSeries: string;
  numTracks: string;
  selectedFullSeriesName: string;
  profileColor: string;
  glassType: string;
  meshType: string;
  handleType: string;
};

const makeId = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const getDate = (offsetDays = 0) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + offsetDays);
  return dt.toISOString().split("T")[0];
};

const toNumber = (value: string) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const WindowDisplay = ({ width, height, numTracks }: { width: number; height: number; numTracks: number }) => {
  const maxWidth = 180;
  const maxHeight = 120;
  let displayWidth = 0;
  let displayHeight = 0;

  if (width > 0 && height > 0) {
    const ar = width / height;
    if (width > height) {
      displayWidth = maxWidth;
      displayHeight = maxWidth / ar;
      if (displayHeight > maxHeight) {
        displayHeight = maxHeight;
        displayWidth = maxHeight * ar;
      }
    } else {
      displayHeight = maxHeight;
      displayWidth = maxHeight * ar;
      if (displayWidth > maxWidth) {
        displayWidth = maxWidth;
        displayHeight = maxWidth / ar;
      }
    }
  }

  const sashCount = numTracks >= 3 ? 3 : 2;
  const sashWidthPercent = 100 / sashCount;

  return (
    <div className="flex items-center justify-center bg-card border rounded-lg p-4 relative w-full h-[170px] mx-auto shadow-inner">
      {width > 0 && height > 0 ? (
        <div className="relative flex border-2 border-primary bg-accent" style={{ width: displayWidth, height: displayHeight }}>
          {Array.from({ length: sashCount }).map((_, index) => {
            const isMesh = (numTracks === 2.5 || numTracks === 3.5) && index === sashCount - 1;
            return (
              <div
                key={index}
                className="relative h-full border-r border-border last:border-r-0"
                style={{ width: `${sashWidthPercent}%` }}
              >
                <div
                  className={`absolute inset-1 flex items-center justify-center text-[9px] font-medium rounded-sm ${
                    isMesh ? "bg-success/20 text-success" : "bg-primary/20 text-primary"
                  }`}
                >
                  {isMesh ? "Mesh" : "Glass"}
                </div>
              </div>
            );
          })}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground">
            {width} mm
          </div>
          <div className="absolute top-1/2 -right-12 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
            {height} mm
          </div>
        </div>
      ) : (
        <span className="text-muted-foreground text-xs font-medium">Enter width and height</span>
      )}
    </div>
  );
};

const calculateWindowCost = (windowItem: DraftWindowItem, baseHardwareCost: number, pricingConfig: ReturnType<typeof getOptimizerPricingConfig>): QuotationWindowItem => {
  const width = toNumber(windowItem.width);
  const height = toNumber(windowItem.height);
  const quantity = Math.max(1, Math.floor(toNumber(windowItem.quantity)));
  const numTracks = toNumber(windowItem.numTracks);

  const unitAreaSqFt = width > 0 && height > 0 ? Number(((width * height) / 92903.04).toFixed(2)) : 0;
  const totalAreaSqFt = Number((unitAreaSqFt * quantity).toFixed(2));

  const seriesConfig = pricingConfig.appSettings.seriesDeductions[windowItem.selectedFullSeriesName];
  const profileNames = [
    seriesConfig?.frameProfile,
    seriesConfig?.sashProfile,
    seriesConfig?.interlockProfile,
    seriesConfig?.beadingProfile,
    seriesConfig?.screenProfile,
  ].filter(Boolean);

  const avgProfileRatePerKg =
    profileNames.length > 0
      ? profileNames.reduce((sum: number, profileName: string) => {
          const configuredRate = pricingConfig.appSettings.useCommonPrice
            ? pricingConfig.appSettings.commonPricePerKg
            : pricingConfig.appSettings.pricePerKg?.[profileName] || 0;
          return sum + configuredRate;
        }, 0) / profileNames.length
      : pricingConfig.appSettings.commonPricePerKg || 100;

  const avgProfileWeightPerMeter =
    profileNames.length > 0
      ? profileNames.reduce((sum: number, profileName: string) => {
          return sum + (pricingConfig.appSettings.weightPerMeter?.[profileName] || 0.7);
        }, 0) / profileNames.length
      : 0.7;

  const profileRatePerSqFt = Math.max(55, avgProfileRatePerKg * avgProfileWeightPerMeter * 2.1);
  const glassRatePerSqFt = pricingConfig.appSettings.glassSettings[windowItem.glassType]?.sheets?.[0]?.costPerSqFt || 0;

  const meshRateMap: Record<string, number> = {
    None: 0,
    "Fiber Mesh": 25,
    "SS304 Mesh": 45,
    "Pleated Mesh": 60,
  };
  const meshRatePerSqFt = meshRateMap[windowItem.meshType] || 0;

  const sashCount = numTracks >= 3 ? 3 : 2;
  const windowTypeMultiplier = windowItem.windowType.toLowerCase().includes("door") ? 1.12 : 1;
  const hardwarePerUnit = baseHardwareCost * (sashCount / 2) * windowTypeMultiplier;

  const unitCost = Number(
    (unitAreaSqFt * (profileRatePerSqFt + glassRatePerSqFt + meshRatePerSqFt) + hardwarePerUnit).toFixed(2),
  );
  const totalCost = Number((unitCost * quantity).toFixed(2));

  return {
    id: windowItem.id,
    serialNumber: windowItem.serialNumber,
    width,
    height,
    quantity,
    windowType: windowItem.windowType,
    topLevelSeries: windowItem.topLevelSeries,
    series: windowItem.selectedFullSeriesName,
    numTracks,
    profileColor: windowItem.profileColor,
    glassType: windowItem.glassType,
    meshType: windowItem.meshType,
    handleType: windowItem.handleType,
    unitAreaSqFt,
    totalAreaSqFt,
    unitCost,
    totalCost,
  };
};

const makeDefaultWindow = (index: number, pricingConfig: ReturnType<typeof getOptimizerPricingConfig>): DraftWindowItem => {
  const firstTopSeries = Object.keys(pricingConfig.trackOptionsMap)[0] || "Slider Eco Window";
  const firstTrack = pricingConfig.trackOptionsMap[firstTopSeries]?.[0];
  const firstGlass = Object.keys(pricingConfig.appSettings.glassSettings)[0] || "5mm Clear Glass";

  return {
    id: makeId(),
    serialNumber: `Window ${index}`,
    width: "",
    height: "",
    quantity: "1",
    windowType: "Sliding Window",
    topLevelSeries: firstTopSeries,
    numTracks: String(firstTrack?.value || 2),
    selectedFullSeriesName: firstTrack?.fullSeriesName || "",
    profileColor: pricingConfig.appSettings.profileColorOptions?.[0] || "Natural",
    glassType: firstGlass,
    meshType: pricingConfig.appSettings.meshTypeOptions?.[0] || "None",
    handleType: pricingConfig.appSettings.handleTypeOptions?.[0] || "Standard",
  };
};

interface CreateQuotationDialogProps {
  onAdd: (quotation: QuotationRecord) => void;
  initialQuotation?: QuotationRecord;
  trigger?: ReactNode;
  title?: string;
  description?: string;
  submitLabel?: string;
}

export function CreateQuotationDialog({
  onAdd,
  initialQuotation,
  trigger,
  title,
  description,
  submitLabel,
}: CreateQuotationDialogProps) {
  const [open, setOpen] = useState(false);
  const pricingConfig = useMemo(() => getOptimizerPricingConfig(), []);
  const windowTypeOptions = pricingConfig.appSettings.windowTypeOptions || [];
  const profileColorOptions = pricingConfig.appSettings.profileColorOptions || [];
  const meshTypeOptions = pricingConfig.appSettings.meshTypeOptions || [];
  const handleTypeOptions = pricingConfig.appSettings.handleTypeOptions || [];
  const defaultHardwareCost = useMemo(
    () => Object.values(pricingConfig.appSettings.hardwareSettings)[0]?.cost || 0,
    [pricingConfig],
  );

  const [projectName, setProjectName] = useState(initialQuotation?.projectName || "");
  const [clientName, setClientName] = useState(initialQuotation?.client || "");
  const [companyName, setCompanyName] = useState(initialQuotation?.company?.name || "");
  const [companyLogoDataUrl, setCompanyLogoDataUrl] = useState(initialQuotation?.company?.logoDataUrl || "");
  const [windows, setWindows] = useState<DraftWindowItem[]>(() => [makeDefaultWindow(1, pricingConfig)]);

  const resetForm = (quotation?: QuotationRecord) => {
    setProjectName(quotation?.projectName || "");
    setClientName(quotation?.client || "");
    setCompanyName(quotation?.company?.name || "");
    setCompanyLogoDataUrl(quotation?.company?.logoDataUrl || "");

    if (quotation?.windows?.length) {
      setWindows(
        quotation.windows.map((item, index) => ({
          id: item.id || makeId(),
          serialNumber: item.serialNumber || `Window ${index + 1}`,
          width: String(item.width || ""),
          height: String(item.height || ""),
          quantity: String(item.quantity || 1),
          windowType: item.windowType || "Sliding Window",
          topLevelSeries: item.topLevelSeries || Object.keys(pricingConfig.trackOptionsMap)[0],
          numTracks: String(item.numTracks || 2),
          selectedFullSeriesName: item.series || "",
          profileColor: item.profileColor || profileColorOptions[0] || "Natural",
          glassType: item.glassType || Object.keys(pricingConfig.appSettings.glassSettings)[0],
          meshType: item.meshType || meshTypeOptions[0] || "None",
          handleType: item.handleType || handleTypeOptions[0] || "Standard",
        })),
      );
      return;
    }

    setWindows([makeDefaultWindow(1, pricingConfig)]);
  };

  useEffect(() => {
    if (open) {
      resetForm(initialQuotation);
    }
  }, [open, initialQuotation]);

  const calculatedWindows = useMemo(
    () => windows.map((windowItem) => calculateWindowCost(windowItem, defaultHardwareCost, pricingConfig)),
    [windows, defaultHardwareCost, pricingConfig],
  );

  const baseTotal = useMemo(
    () => Number(calculatedWindows.reduce((sum, item) => sum + item.totalCost, 0).toFixed(2)),
    [calculatedWindows],
  );

  const addWindow = () => {
    setWindows((prev) => [...prev, makeDefaultWindow(prev.length + 1, pricingConfig)]);
  };

  const removeWindow = (id: string) => {
    if (windows.length <= 1) return;
    setWindows((prev) => prev.filter((item) => item.id !== id));
  };

  const updateWindow = (id: string, field: keyof DraftWindowItem, value: string) => {
    setWindows((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const next = { ...item, [field]: value };

        if (field === "topLevelSeries") {
          const firstTrack = pricingConfig.trackOptionsMap[value]?.[0];
          next.numTracks = String(firstTrack?.value || 2);
          next.selectedFullSeriesName = firstTrack?.fullSeriesName || "";
        }

        if (field === "numTracks") {
          const selectedTrack = pricingConfig.trackOptionsMap[item.topLevelSeries]?.find(
            (option) => String(option.value) === value,
          );
          if (selectedTrack) {
            next.selectedFullSeriesName = selectedTrack.fullSeriesName;
          }
        }

        return next;
      }),
    );
  };

  const onLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCompanyLogoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const validWindows = calculatedWindows.filter((item) => item.width > 0 && item.height > 0 && item.quantity > 0);

    const lineItems: QuotationLineItem[] = validWindows.map((item) => ({
      id: makeId(),
      optionId: `window:${item.serialNumber}`,
      label: `${item.serialNumber} - ${item.series}`,
      category: "custom",
      quantity: item.quantity,
      unitPrice: item.unitCost,
      totalPrice: item.totalCost,
      priceManuallyEdited: false,
      isMandatoryGst: false,
      gstAmount: 0,
      gstApplied: false,
    }));

    const quotation: QuotationRecord = {
      id: `QUO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      projectName,
      client: clientName,
      date: getDate(0),
      validUntil: getDate(14),
      amount: baseTotal,
      gstAmount: 0,
      totalAmount: baseTotal,
      status: "draft",
      itemsCount: validWindows.length,
      company: {
        name: companyName,
        logoDataUrl: companyLogoDataUrl || undefined,
      },
      windows: validWindows,
      lineItems,
      gstPercentage: 0,
      billWithGst: false,
    };

    onAdd(quotation);
    downloadQuotationPdf(quotation);

    setOpen(false);
    resetForm(initialQuotation);
  };

  const hasAtLeastOneValidWindow = calculatedWindows.some((windowItem) => windowItem.width > 0 && windowItem.height > 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 text-xs h-8">
            <Plus className="h-4 w-4" />
            Create Quotation
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[1180px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || "Generate Window-wise Quotation"}</DialogTitle>
          <DialogDescription>
            {description ||
              "Add project details and window inputs. The quotation result is generated window-wise with size, spec, drawing, and cost."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Project Name</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Client Name</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Company Name</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Company Logo</Label>
              <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={onLogoUpload} />
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Window Inputs</h4>
              <Button type="button" variant="outline" className="gap-2" onClick={addWindow}>
                <Plus className="h-4 w-4" /> Add Window
              </Button>
            </div>

            <div className="space-y-4">
              {windows.map((windowItem) => {
                const trackOptions = pricingConfig.trackOptionsMap[windowItem.topLevelSeries] || [];
                const calculated = calculatedWindows.find((entry) => entry.id === windowItem.id);

                return (
                  <div key={windowItem.id} className="rounded-md border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{windowItem.serialNumber}</p>
                      {windows.length > 1 ? (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeWindow(windowItem.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      <div className="lg:col-span-8 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Window Serial Number</Label>
                            <Input
                              value={windowItem.serialNumber}
                              onChange={(e) => updateWindow(windowItem.id, "serialNumber", e.target.value)}
                              placeholder="Window 1"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Width (mm)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={windowItem.width}
                              onChange={(e) => updateWindow(windowItem.id, "width", e.target.value)}
                              placeholder="1200"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Height (mm)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={windowItem.height}
                              onChange={(e) => updateWindow(windowItem.id, "height", e.target.value)}
                              placeholder="1400"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={windowItem.quantity}
                              onChange={(e) => updateWindow(windowItem.id, "quantity", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Window Type</Label>
                            <Select
                              value={windowItem.windowType}
                              onValueChange={(value) => updateWindow(windowItem.id, "windowType", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {windowTypeOptions.map((item) => (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Profile Colour</Label>
                            <Select
                              value={windowItem.profileColor}
                              onValueChange={(value) => updateWindow(windowItem.id, "profileColor", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {profileColorOptions.map((item) => (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Series</Label>
                            <Select
                              value={windowItem.topLevelSeries}
                              onValueChange={(value) => updateWindow(windowItem.id, "topLevelSeries", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(pricingConfig.trackOptionsMap).map((item) => (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Track Option</Label>
                            <Select
                              value={windowItem.numTracks}
                              onValueChange={(value) => updateWindow(windowItem.id, "numTracks", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {trackOptions.map((option) => (
                                  <SelectItem key={option.fullSeriesName} value={String(option.value)}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Selected Series Name</Label>
                            <Input value={windowItem.selectedFullSeriesName} readOnly />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Glass Thickness and Colour</Label>
                            <Select
                              value={windowItem.glassType}
                              onValueChange={(value) => updateWindow(windowItem.id, "glassType", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(pricingConfig.appSettings.glassSettings).map((item) => (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Mesh Type</Label>
                            <Select
                              value={windowItem.meshType}
                              onValueChange={(value) => updateWindow(windowItem.id, "meshType", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {meshTypeOptions.map((item) => (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Handle Type</Label>
                            <Select
                              value={windowItem.handleType}
                              onValueChange={(value) => updateWindow(windowItem.id, "handleType", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {handleTypeOptions.map((item) => (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div className="rounded-md border p-2">
                            Unit Area: <span className="font-semibold text-foreground">{calculated?.unitAreaSqFt.toFixed(2) || "0.00"} ft²</span>
                          </div>
                          <div className="rounded-md border p-2">
                            Unit Cost: <span className="font-semibold text-foreground">Rs {(calculated?.unitCost || 0).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="rounded-md border p-2">
                            Total Cost: <span className="font-semibold text-foreground">Rs {(calculated?.totalCost || 0).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-4">
                        <WindowDisplay
                          width={toNumber(windowItem.width)}
                          height={toNumber(windowItem.height)}
                          numTracks={toNumber(windowItem.numTracks)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="text-sm font-semibold">Calculated Summary</h4>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="text-left p-2">Window</th>
                    <th className="text-left p-2">Size</th>
                    <th className="text-left p-2">Qty</th>
                    <th className="text-left p-2">Series</th>
                    <th className="text-left p-2">Mesh</th>
                    <th className="text-left p-2">Handle</th>
                    <th className="text-left p-2">Glass</th>
                    <th className="text-right p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedWindows.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{item.serialNumber}</td>
                      <td className="p-2">{item.width} x {item.height} mm</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">{item.series}</td>
                      <td className="p-2">{item.meshType}</td>
                      <td className="p-2">{item.handleType}</td>
                      <td className="p-2">{item.glassType}</td>
                      <td className="p-2 text-right font-semibold">Rs {item.totalCost.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-right text-base font-bold">Grand Total: Rs {baseTotal.toLocaleString("en-IN")}</div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!projectName || !clientName || !companyName || !hasAtLeastOneValidWindow}>
              {submitLabel || "Calculate and Generate Quotation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2 } from "lucide-react";
import {
  cloneOptimizerPricingConfig,
  defaultOptimizerPricingConfig,
  getOptimizerPricingConfig,
  OptimizerPricingConfig,
  saveOptimizerPricingConfig,
} from "@/lib/optimizerPricingConfig";

const toNumber = (value: string) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const seriesNumericKeys = [
  "sashLengthDeduction",
  "sashWidthOverlap",
  "interlockLengthDeduction",
  "beadingDeduction",
  "screenLengthDeduction",
];

const seriesProfileKeys = ["frameProfile", "sashProfile", "interlockProfile", "beadingProfile", "screenProfile"];

export default function ProfilePage() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "configure-pricing" ? "configure-pricing" : "account";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [draftConfig, setDraftConfig] = useState<OptimizerPricingConfig>(() => cloneOptimizerPricingConfig(getOptimizerPricingConfig()));

  const [newProfileName, setNewProfileName] = useState("");
  const [newGlassTypeName, setNewGlassTypeName] = useState("");
  const [newHardwareTypeName, setNewHardwareTypeName] = useState("");
  const [newSeriesName, setNewSeriesName] = useState("");
  const [newTopLevelSeriesName, setNewTopLevelSeriesName] = useState("");
  const [newWindowTypeOption, setNewWindowTypeOption] = useState("");
  const [newProfileColorOption, setNewProfileColorOption] = useState("");
  const [newMeshTypeOption, setNewMeshTypeOption] = useState("");
  const [newHandleTypeOption, setNewHandleTypeOption] = useState("");

  const allProfiles = useMemo(() => {
    const set = new Set<string>();
    Object.keys(draftConfig.appSettings.stockLengths).forEach((v) => set.add(v));
    Object.keys(draftConfig.appSettings.pricePerKg).forEach((v) => set.add(v));
    Object.keys(draftConfig.appSettings.weightPerMeter).forEach((v) => set.add(v));
    Object.keys(draftConfig.appSettings.usableRemittanceThresholds).forEach((v) => set.add(v));
    Object.keys(draftConfig.appSettings.fixedNegligibleWasteLimit).forEach((v) => set.add(v));
    Object.keys(draftConfig.appSettings.profileDimensions).forEach((v) => set.add(v));
    return Array.from(set).sort();
  }, [draftConfig]);

  const updateCoreSetting = (key: keyof OptimizerPricingConfig["appSettings"], value: string | boolean) => {
    setDraftConfig((prev) => {
      const normalizedValue = typeof value === "boolean" ? value : toNumber(value);
      return {
        ...prev,
        appSettings: {
          ...prev.appSettings,
          [key]: normalizedValue,
        },
      };
    });
  };

  const updateProfileSetting = (
    key:
      | "stockLengths"
      | "pricePerKg"
      | "weightPerMeter"
      | "usableRemittanceThresholds"
      | "fixedNegligibleWasteLimit",
    profileName: string,
    value: string,
  ) => {
    setDraftConfig((prev) => ({
      ...prev,
      appSettings: {
        ...prev.appSettings,
        [key]: {
          ...prev.appSettings[key],
          [profileName]: toNumber(value),
        },
      },
    }));
  };

  const updateProfileDimension = (profileName: string, value: string) => {
    setDraftConfig((prev) => ({
      ...prev,
      appSettings: {
        ...prev.appSettings,
        profileDimensions: {
          ...prev.appSettings.profileDimensions,
          [profileName]: {
            ...(prev.appSettings.profileDimensions[profileName] || {}),
            height: toNumber(value),
          },
        },
      },
    }));
  };

  const updateMandatoryGst = (optionId: string, checked: boolean) => {
    setDraftConfig((prev) => ({
      ...prev,
      appSettings: {
        ...prev.appSettings,
        mandatoryGstByOptionId: {
          ...prev.appSettings.mandatoryGstByOptionId,
          [optionId]: checked,
        },
      },
    }));
  };

  const addProfile = () => {
    const name = newProfileName.trim();
    if (!name) return;
    setDraftConfig((prev) => ({
      ...prev,
      appSettings: {
        ...prev.appSettings,
        stockLengths: { ...prev.appSettings.stockLengths, [name]: 5900 },
        pricePerKg: { ...prev.appSettings.pricePerKg, [name]: 100 },
        weightPerMeter: { ...prev.appSettings.weightPerMeter, [name]: 1 },
        usableRemittanceThresholds: { ...prev.appSettings.usableRemittanceThresholds, [name]: 200 },
        fixedNegligibleWasteLimit: { ...prev.appSettings.fixedNegligibleWasteLimit, [name]: 100 },
        profileDimensions: { ...prev.appSettings.profileDimensions, [name]: { height: 50 } },
      },
    }));
    setNewProfileName("");
  };

  const removeProfile = (profileName: string) => {
    setDraftConfig((prev) => {
      const next = cloneOptimizerPricingConfig(prev);
      delete next.appSettings.mandatoryGstByOptionId[`profile:${profileName}`];
      delete next.appSettings.stockLengths[profileName];
      delete next.appSettings.pricePerKg[profileName];
      delete next.appSettings.weightPerMeter[profileName];
      delete next.appSettings.usableRemittanceThresholds[profileName];
      delete next.appSettings.fixedNegligibleWasteLimit[profileName];
      delete next.appSettings.profileDimensions[profileName];

      Object.keys(next.appSettings.seriesDeductions).forEach((seriesName) => {
        const series = next.appSettings.seriesDeductions[seriesName];
        seriesProfileKeys.forEach((key) => {
          if (series[key] === profileName) {
            series[key] = "";
          }
        });
      });

      return next;
    });
  };

  const updateHardwareCost = (hardwareType: string, value: string) => {
    const cost = toNumber(value);
    setDraftConfig((prev) => ({
      ...prev,
      appSettings: {
        ...prev.appSettings,
        hardwareSettings: {
          ...prev.appSettings.hardwareSettings,
          [hardwareType]: {
            ...prev.appSettings.hardwareSettings[hardwareType],
            cost,
          },
        },
      },
    }));
  };

  const addHardwareType = () => {
    const name = newHardwareTypeName.trim();
    if (!name) return;
    setDraftConfig((prev) => ({
      ...prev,
      appSettings: {
        ...prev.appSettings,
        hardwareSettings: {
          ...prev.appSettings.hardwareSettings,
          [name]: { cost: 0 },
        },
      },
    }));
    setNewHardwareTypeName("");
  };

  const removeHardwareType = (hardwareType: string) => {
    setDraftConfig((prev) => {
      const next = cloneOptimizerPricingConfig(prev);
      delete next.appSettings.mandatoryGstByOptionId[`hardware:${hardwareType}`];
      delete next.appSettings.hardwareSettings[hardwareType];
      return next;
    });
  };

  const updateGlassTypeField = (glassType: string, field: "processingType" | "purchaseMargin", value: string) => {
    setDraftConfig((prev) => ({
      ...prev,
      appSettings: {
        ...prev.appSettings,
        glassSettings: {
          ...prev.appSettings.glassSettings[glassType],
          [field]: field === "processingType" ? value : toNumber(value),
        },
      },
    }));
  };

  const updateGlassSheet = (glassType: string, index: number, field: "sheetWidth" | "sheetHeight" | "costPerSqFt", value: string) => {
    setDraftConfig((prev) => {
      const sheets = [...(prev.appSettings.glassSettings[glassType]?.sheets || [])];
      sheets[index] = { ...sheets[index], [field]: toNumber(value) };
      return {
        ...prev,
        appSettings: {
          ...prev.appSettings,
          glassSettings: {
            ...prev.appSettings.glassSettings[glassType],
            sheets,
          },
        },
      };
    });
  };

  const addGlassSheet = (glassType: string) => {
    setDraftConfig((prev) => {
      const current = prev.appSettings.glassSettings[glassType];
      const nextId = (current.sheets[current.sheets.length - 1]?.id || 0) + 1;
      return {
        ...prev,
        appSettings: {
          ...prev.appSettings,
          glassSettings: {
            ...current,
            sheets: [...current.sheets, { id: nextId, sheetWidth: 2440, sheetHeight: 1830, costPerSqFt: 0 }],
          },
        },
      };
    });
  };

  const removeGlassSheet = (glassType: string, index: number) => {
    setDraftConfig((prev) => {
      const current = prev.appSettings.glassSettings[glassType];
      const nextSheets = current.sheets.filter((_, i) => i !== index);
      return {
        ...prev,
        appSettings: {
          ...prev.appSettings,
          glassSettings: {
            ...current,
            sheets: nextSheets.length > 0 ? nextSheets : [{ id: 1, sheetWidth: 2440, sheetHeight: 1830, costPerSqFt: 0 }],
          },
        },
      };
    });
  };

  const addGlassType = () => {
    const name = newGlassTypeName.trim();
    if (!name) return;
    setDraftConfig((prev) => ({
      ...prev,
      appSettings: {
        ...prev.appSettings,
        glassSettings: {
          ...prev.appSettings.glassSettings,
          [name]: {
            processingType: "In-House",
            purchaseMargin: 10,
            sheets: [{ id: 1, sheetWidth: 2440, sheetHeight: 1830, costPerSqFt: 0 }],
          },
        },
      },
    }));
    setNewGlassTypeName("");
  };

  const removeGlassType = (glassType: string) => {
    setDraftConfig((prev) => {
      const next = cloneOptimizerPricingConfig(prev);
      delete next.appSettings.mandatoryGstByOptionId[`glass:${glassType}`];
      delete next.appSettings.glassSettings[glassType];
      return next;
    });
  };

  const updateSeriesNumeric = (seriesName: string, key: string, value: string) => {
    setDraftConfig((prev) => ({
      ...prev,
      appSettings: {
        ...prev.appSettings,
        seriesDeductions: {
          ...prev.appSettings.seriesDeductions[seriesName],
          [key]: toNumber(value),
        },
      },
    }));
  };

  const updateSeriesProfile = (seriesName: string, key: string, profileName: string) => {
    setDraftConfig((prev) => ({
      ...prev,
      appSettings: {
        ...prev.appSettings,
        seriesDeductions: {
          ...prev.appSettings.seriesDeductions[seriesName],
          [key]: profileName,
        },
      },
    }));
  };

  const addSeries = () => {
    const name = newSeriesName.trim();
    if (!name) return;
    setDraftConfig((prev) => ({
      ...prev,
      appSettings: {
        ...prev.appSettings,
        seriesDeductions: {
          [name]: {
            sashLengthDeduction: 0,
            sashWidthOverlap: 0,
            interlockLengthDeduction: 0,
            beadingDeduction: 0,
            screenLengthDeduction: 0,
            frameProfile: allProfiles[0] || "",
            sashProfile: allProfiles[0] || "",
            interlockProfile: allProfiles[0] || "",
            beadingProfile: allProfiles[0] || "",
            screenProfile: allProfiles[0] || "",
            glassSash: { widthDeduction: 0, sashHeightAdjustment: 0 },
            beading: { heightDeduction: 0, widthDeduction: 0 },
            interlockHeightDeduction: 0,
          },
        },
      },
    }));
    setNewSeriesName("");
  };

  const removeSeries = (seriesName: string) => {
    setDraftConfig((prev) => {
      const next = cloneOptimizerPricingConfig(prev);
      delete next.appSettings.mandatoryGstByOptionId[`series:${seriesName}`];
      delete next.appSettings.seriesDeductions[seriesName];
      return next;
    });
  };

  const addTopLevelSeries = () => {
    const name = newTopLevelSeriesName.trim();
    if (!name) return;
    setDraftConfig((prev) => ({
      ...prev,
      trackOptionsMap: {
        ...prev.trackOptionsMap,
        [name]: [{ label: "2 Tracks", value: 2, fullSeriesName: "" }],
      },
    }));
    setNewTopLevelSeriesName("");
  };

  const removeTopLevelSeries = (seriesName: string) => {
    setDraftConfig((prev) => {
      const next = cloneOptimizerPricingConfig(prev);
      delete next.trackOptionsMap[seriesName];
      return next;
    });
  };

  const updateTrackOption = (seriesName: string, index: number, key: keyof (typeof draftConfig.trackOptionsMap)[string][number], value: string) => {
    setDraftConfig((prev) => {
      const nextOptions = [...(prev.trackOptionsMap[seriesName] || [])];
      nextOptions[index] = {
        ...nextOptions[index],
        [key]: key === "value" ? toNumber(value) : value,
      };

      return {
        ...prev,
        trackOptionsMap: {
          ...prev.trackOptionsMap,
          [seriesName]: nextOptions,
        },
      };
    });
  };

  const addTrackOption = (seriesName: string) => {
    setDraftConfig((prev) => ({
      ...prev,
      trackOptionsMap: {
        ...prev.trackOptionsMap,
        [seriesName]: [
          ...(prev.trackOptionsMap[seriesName] || []),
          { label: "New Track", value: 2, fullSeriesName: "" },
        ],
      },
    }));
  };

  const removeTrackOption = (seriesName: string, index: number) => {
    setDraftConfig((prev) => {
      const nextOptions = (prev.trackOptionsMap[seriesName] || []).filter((_, i) => i !== index);
      return {
        ...prev,
        trackOptionsMap: {
          ...prev.trackOptionsMap,
          [seriesName]: nextOptions.length > 0 ? nextOptions : [{ label: "2 Tracks", value: 2, fullSeriesName: "" }],
        },
      };
    });
  };

  const addQuotationOption = (
    key: "windowTypeOptions" | "profileColorOptions" | "meshTypeOptions" | "handleTypeOptions",
    value: string,
    reset: () => void,
  ) => {
    const nextValue = value.trim();
    if (!nextValue) return;

    setDraftConfig((prev) => {
      const current = prev.appSettings[key] || [];
      if (current.includes(nextValue)) return prev;

      return {
        ...prev,
        appSettings: {
          ...prev.appSettings,
          [key]: [...current, nextValue],
        },
      };
    });

    reset();
  };

  const removeQuotationOption = (
    key: "windowTypeOptions" | "profileColorOptions" | "meshTypeOptions" | "handleTypeOptions",
    index: number,
  ) => {
    setDraftConfig((prev) => {
      const current = prev.appSettings[key] || [];
      const next = current.filter((_, i) => i !== index);
      if (next.length === 0) return prev;

      return {
        ...prev,
        appSettings: {
          ...prev.appSettings,
          [key]: next,
        },
      };
    });
  };

  const saveDraft = () => {
    try {
      saveOptimizerPricingConfig(draftConfig);
      setDraftConfig(cloneOptimizerPricingConfig(draftConfig));

      toast({
        title: "Pricing configuration saved",
        description: "All profile, glass, hardware, pricing and series settings were updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Unable to save",
        description: error?.message || "There was an issue while saving pricing configuration.",
      });
    }
  };

  const resetToDefault = () => {
    const resetConfig = cloneOptimizerPricingConfig(defaultOptimizerPricingConfig);
    setDraftConfig(resetConfig);
    saveOptimizerPricingConfig(resetConfig);

    toast({
      title: "Default configuration restored",
      description: "Pricing and optimizer settings were reset to system defaults.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Profile" description="Manage account preferences and pricing configuration" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-background border border-border">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="configure-pricing">Configure Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Profile controls will continue to expand here.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Use the Configure Pricing tab to control all cutting optimizer pricing inputs.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configure-pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quotation GST</CardTitle>
              <CardDescription>Set the GST percentage used for quotations.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>GST Percentage (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={draftConfig.appSettings.gstPercentage || 0}
                  onChange={(e) => updateCoreSetting("gstPercentage", e.target.value)}
                  placeholder="Enter GST percentage"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>Core optimizer and costing settings from your reference module.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Kerf Thickness (mm)</Label>
                <Input
                  type="number"
                  value={draftConfig.appSettings.kerfThickness}
                  onChange={(e) => updateCoreSetting("kerfThickness", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Welding Thickness (mm)</Label>
                <Input
                  type="number"
                  value={draftConfig.appSettings.weldingThickness}
                  onChange={(e) => updateCoreSetting("weldingThickness", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Edge Trim Thickness (mm)</Label>
                <Input
                  type="number"
                  value={draftConfig.appSettings.edgeTrimThickness}
                  onChange={(e) => updateCoreSetting("edgeTrimThickness", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Glass Cut Size (mm)</Label>
                <Input
                  type="number"
                  value={draftConfig.appSettings.minGlassCutSize}
                  onChange={(e) => updateCoreSetting("minGlassCutSize", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Common Stock Length (mm)</Label>
                <Input
                  type="number"
                  value={draftConfig.appSettings.commonStockLength}
                  onChange={(e) => updateCoreSetting("commonStockLength", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Common Price Per Kg</Label>
                <Input                  type="number"
                  value={draftConfig.appSettings.commonPricePerKg}
                  onChange={(e) => updateCoreSetting("commonPricePerKg", e.target.value)}
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Use Common Stock Length</p>
                  <p className="text-xs text-muted-foreground">Toggle between one global stock size and per-profile stock sizes.</p>
                </div>
                <Switch
                  checked={draftConfig.appSettings.useCommonStockLength}
                  onCheckedChange={(checked) => updateCoreSetting("useCommonStockLength", checked)}
                />
              </div>
              <div className="md:col-span-1 flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Use Common Price</p>
                  <p className="text-xs text-muted-foreground">Use one price per kg for all profiles.</p>
                </div>
                <Switch
                  checked={draftConfig.appSettings.useCommonPrice}
                  onCheckedChange={(checked) => updateCoreSetting("useCommonPrice", checked)}
                />
              </div>
              <div className="md:col-span-3 flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Use Dynamic Min Glass Cut Size</p>
                  <p className="text-xs text-muted-foreground">Automatic min remnant sizing based on glass thickness.</p>
                </div>
                <Switch
                  checked={draftConfig.appSettings.useDynamicMinGlassCutSize}
                  onCheckedChange={(checked) => updateCoreSetting("useDynamicMinGlassCutSize", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Track Options Map</CardTitle>
              <CardDescription>Add, update and remove top-level series and their track options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">Quotation Option Lists</CardTitle>
                  <CardDescription>
                    Manage dropdown options used while creating window-wise quotations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3 space-y-2">
                      <Label>Window Types</Label>
                      <div className="space-y-2 max-h-40 overflow-auto">
                        {draftConfig.appSettings.windowTypeOptions.map((item, index) => (
                          <div key={`window-type-${item}-${index}`} className="flex items-center justify-between rounded border px-2 py-1">
                            <span className="text-sm">{item}</span>
                            <Button size="icon" variant="ghost" onClick={() => removeQuotationOption("windowTypeOptions", index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input value={newWindowTypeOption} onChange={(e) => setNewWindowTypeOption(e.target.value)} placeholder="Add window type" />
                        <Button onClick={() => addQuotationOption("windowTypeOptions", newWindowTypeOption, () => setNewWindowTypeOption(""))}>Add</Button>
                      </div>
                    </div>

                    <div className="rounded-lg border p-3 space-y-2">
                      <Label>Profile Colours</Label>
                      <div className="space-y-2 max-h-40 overflow-auto">
                        {draftConfig.appSettings.profileColorOptions.map((item, index) => (
                          <div key={`profile-color-${item}-${index}`} className="flex items-center justify-between rounded border px-2 py-1">
                            <span className="text-sm">{item}</span>
                            <Button size="icon" variant="ghost" onClick={() => removeQuotationOption("profileColorOptions", index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input value={newProfileColorOption} onChange={(e) => setNewProfileColorOption(e.target.value)} placeholder="Add profile colour" />
                        <Button onClick={() => addQuotationOption("profileColorOptions", newProfileColorOption, () => setNewProfileColorOption(""))}>Add</Button>
                      </div>
                    </div>

                    <div className="rounded-lg border p-3 space-y-2">
                      <Label>Mesh Types</Label>
                      <div className="space-y-2 max-h-40 overflow-auto">
                        {draftConfig.appSettings.meshTypeOptions.map((item, index) => (
                          <div key={`mesh-type-${item}-${index}`} className="flex items-center justify-between rounded border px-2 py-1">
                            <span className="text-sm">{item}</span>
                            <Button size="icon" variant="ghost" onClick={() => removeQuotationOption("meshTypeOptions", index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input value={newMeshTypeOption} onChange={(e) => setNewMeshTypeOption(e.target.value)} placeholder="Add mesh type" />
                        <Button onClick={() => addQuotationOption("meshTypeOptions", newMeshTypeOption, () => setNewMeshTypeOption(""))}>Add</Button>
                      </div>
                    </div>

                    <div className="rounded-lg border p-3 space-y-2">
                      <Label>Handle Types</Label>
                      <div className="space-y-2 max-h-40 overflow-auto">
                        {draftConfig.appSettings.handleTypeOptions.map((item, index) => (
                          <div key={`handle-type-${item}-${index}`} className="flex items-center justify-between rounded border px-2 py-1">
                            <span className="text-sm">{item}</span>
                            <Button size="icon" variant="ghost" onClick={() => removeQuotationOption("handleTypeOptions", index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input value={newHandleTypeOption} onChange={(e) => setNewHandleTypeOption(e.target.value)} placeholder="Add handle type" />
                        <Button onClick={() => addQuotationOption("handleTypeOptions", newHandleTypeOption, () => setNewHandleTypeOption(""))}>Add</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {Object.entries(draftConfig.trackOptionsMap).map(([seriesName, options]) => (
                <div key={seriesName} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{seriesName}</p>
                    <Button size="sm" variant="destructive" onClick={() => removeTopLevelSeries(seriesName)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove Series
                    </Button>
                  </div>
                  {options.map((option, index) => (
                    <div key={`${seriesName}-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <Input
                        className="md:col-span-5"
                        value={option.label}
                        onChange={(e) => updateTrackOption(seriesName, index, "label", e.target.value)}
                        placeholder="Option label"
                      />
                      <Input
                        className="md:col-span-2"
                        type="number"
                        value={option.value}
                        onChange={(e) => updateTrackOption(seriesName, index, "value", e.target.value)}
                        placeholder="Track"
                      />
                      <Input
                        className="md:col-span-4"
                        value={option.fullSeriesName}
                        onChange={(e) => updateTrackOption(seriesName, index, "fullSeriesName", e.target.value)}
                        placeholder="Full series name"
                      />
                      <Button className="md:col-span-1" size="icon" variant="ghost" onClick={() => removeTrackOption(seriesName, index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => addTrackOption(seriesName)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Track Option
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input                  value={newTopLevelSeriesName}
                  onChange={(e) => setNewTopLevelSeriesName(e.target.value)}
                  placeholder="New top-level series name"
                />
                <Button onClick={addTopLevelSeries}>Add Series</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hardware Settings</CardTitle>
              <CardDescription>Add, update and remove hardware options and cost.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(draftConfig.appSettings.hardwareSettings).map(([hardwareType, settings]) => (
                <div key={hardwareType} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                  <Label className="md:col-span-3">{hardwareType}</Label>
                  <Input
                    className="md:col-span-6"
                    type="number"
                    value={settings?.cost ?? 0}
                    onChange={(e) => updateHardwareCost(hardwareType, e.target.value)}
                  />
                  <div className="md:col-span-2 flex items-center justify-between rounded-md border border-border px-2 py-1.5">
                    <span className="text-xs">Mandatory GST</span>
                    <Switch
                      checked={draftConfig.appSettings.mandatoryGstByOptionId[`hardware:${hardwareType}`] ?? false}
                      onCheckedChange={(checked) => updateMandatoryGst(`hardware:${hardwareType}`, checked)}
                    />
                  </div>
                  <Button className="md:col-span-1" size="icon" variant="ghost" onClick={() => removeHardwareType(hardwareType)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newHardwareTypeName}
                  onChange={(e) => setNewHardwareTypeName(e.target.value)}
                  placeholder="New hardware type"
                />
                <Button onClick={addHardwareType}>Add Hardware</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Glass Settings</CardTitle>
              <CardDescription>Full glass type configuration with add, remove and sheet-level updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(draftConfig.appSettings.glassSettings).map(([glassType, config]) => (
                <div key={glassType} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{glassType}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Mandatory GST</span>
                        <Switch
                          checked={draftConfig.appSettings.mandatoryGstByOptionId[`glass:${glassType}`] ?? false}
                          onCheckedChange={(checked) => updateMandatoryGst(`glass:${glassType}`, checked)}
                        />
                      </div>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => removeGlassType(glassType)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove Glass
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Processing Type</Label>
                      <Select
                        value={config.processingType}
                        onValueChange={(value) => updateGlassTypeField(glassType, "processingType", value)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="In-House">In-House</SelectItem>
                          <SelectItem value="Outsourced">Outsourced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Purchase Margin (mm)</Label>
                      <Input
                        type="number"
                        value={config.purchaseMargin}
                        onChange={(e) => updateGlassTypeField(glassType, "purchaseMargin", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {config.sheets.map((sheet, index) => (
                      <div key={`${glassType}-${sheet.id}-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                        <Input
                          className="md:col-span-3"
                          type="number"
                          value={sheet.sheetWidth}
                          onChange={(e) => updateGlassSheet(glassType, index, "sheetWidth", e.target.value)}
                          placeholder="Width"
                        />
                        <Input
                          className="md:col-span-3"
                          type="number"
                          value={sheet.sheetHeight}
                          onChange={(e) => updateGlassSheet(glassType, index, "sheetHeight", e.target.value)}
                          placeholder="Height"
                        />
                        <Input
                          className="md:col-span-5"
                          type="number"
                          value={sheet.costPerSqFt}
                          onChange={(e) => updateGlassSheet(glassType, index, "costPerSqFt", e.target.value)}
                          placeholder="Cost/sqft"
                        />
                        <Button className="md:col-span-1" size="icon" variant="ghost" onClick={() => removeGlassSheet(glassType, index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button size="sm" variant="outline" onClick={() => addGlassSheet(glassType)}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Sheet Size
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Input value={newGlassTypeName} onChange={(e) => setNewGlassTypeName(e.target.value)} placeholder="New glass type" />
                <Button onClick={addGlassType}>Add Glass Type</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Add, edit, update and delete all profile-level pricing and threshold values.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-2">Profile</th>
                      <th className="text-left py-2 pr-2">Stock Len</th>
                      <th className="text-left py-2 pr-2">Price/Kg</th>
                      <th className="text-left py-2 pr-2">Weight/M</th>
                      <th className="text-left py-2 pr-2">Usable Rem</th>
                      <th className="text-left py-2 pr-2">Negligible</th>
                      <th className="text-left py-2 pr-2">Height</th>
                      <th className="text-left py-2 pr-2">Mandatory GST</th>
                      <th className="text-left py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allProfiles.map((profileName) => (
                      <tr key={profileName} className="border-b">
                        <td className="py-2 pr-2 font-medium">{profileName}</td>
                        <td className="py-2 pr-2"><Input type="number" value={draftConfig.appSettings.stockLengths[profileName] || 0} onChange={(e) => updateProfileSetting("stockLengths", profileName, e.target.value)} disabled={draftConfig.appSettings.useCommonStockLength} /></td>
                        <td className="py-2 pr-2"><Input type="number" value={draftConfig.appSettings.pricePerKg[profileName] || 0} onChange={(e) => updateProfileSetting("pricePerKg", profileName, e.target.value)} disabled={draftConfig.appSettings.useCommonPrice} /></td>
                        <td className="py-2 pr-2"><Input type="number" value={draftConfig.appSettings.weightPerMeter[profileName] || 0} onChange={(e) => updateProfileSetting("weightPerMeter", profileName, e.target.value)} /></td>
                        <td className="py-2 pr-2"><Input type="number" value={draftConfig.appSettings.usableRemittanceThresholds[profileName] || 0} onChange={(e) => updateProfileSetting("usableRemittanceThresholds", profileName, e.target.value)} /></td>
                        <td className="py-2 pr-2"><Input type="number" value={draftConfig.appSettings.fixedNegligibleWasteLimit[profileName] || 0} onChange={(e) => updateProfileSetting("fixedNegligibleWasteLimit", profileName, e.target.value)} /></td>
                        <td className="py-2 pr-2"><Input type="number" value={draftConfig.appSettings.profileDimensions[profileName]?.height || 0} onChange={(e) => updateProfileDimension(profileName, e.target.value)} /></td>
                        <td className="py-2 pr-2">
                          <Switch
                            checked={draftConfig.appSettings.mandatoryGstByOptionId[`profile:${profileName}`] ?? false}
                            onCheckedChange={(checked) => updateMandatoryGst(`profile:${profileName}`, checked)}
                          />
                        </td>
                        <td className="py-2"><Button size="icon" variant="ghost" onClick={() => removeProfile(profileName)}><Trash2 className="h-4 w-4" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2">
                <Input value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} placeholder="New profile name" />
                <Button onClick={addProfile}>Add Profile</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Series Deductions And Profiles</CardTitle>
              <CardDescription>Configure numerical deductions and profile assignments for each series.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(draftConfig.appSettings.seriesDeductions).map(([seriesName, deductions]) => (
                <div key={seriesName} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{seriesName}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Mandatory GST</span>
                        <Switch
                          checked={draftConfig.appSettings.mandatoryGstByOptionId[`series:${seriesName}`] ?? false}
                          onCheckedChange={(checked) => updateMandatoryGst(`series:${seriesName}`, checked)}
                        />
                      </div>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => removeSeries(seriesName)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove Series
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {seriesNumericKeys.map((key) => (
                      <div key={`${seriesName}-${key}`} className="space-y-1">
                        <Label className="text-xs">{key}</Label>
                        <Input
                          type="number"
                          value={deductions[key] ?? 0}
                          onChange={(e) => updateSeriesNumeric(seriesName, key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {seriesProfileKeys.map((key) => (
                      <div key={`${seriesName}-${key}`} className="space-y-1">
                        <Label className="text-xs">{key}</Label>
                        <Select value={deductions[key] || ""} onValueChange={(value) => updateSeriesProfile(seriesName, key, value)}>
                          <SelectTrigger><SelectValue placeholder="Select Profile" /></SelectTrigger>
                          <SelectContent>
                            {allProfiles.map((profileName) => (
                              <SelectItem key={`${seriesName}-${key}-${profileName}`} value={profileName}>{profileName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Input value={newSeriesName} onChange={(e) => setNewSeriesName(e.target.value)} placeholder="New series name" />
                <Button onClick={addSeries}>Add Series</Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={saveDraft} className="sm:w-auto w-full">Save Pricing Configuration</Button>
            <Button variant="outline" onClick={resetToDefault} className="sm:w-auto w-full">Reset To Default</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
export type TrackOption = {
  label: string;
  value: number;
  fullSeriesName: string;
};

export type GlassSheetConfig = {
  id: number;
  sheetWidth: number;
  sheetHeight: number;
  costPerSqFt: number;
};

export type GlassTypeConfig = {
  processingType: "In-House" | "Outsourced";
  purchaseMargin: number;
  sheets: GlassSheetConfig[];
};

export type OptimizerAppSettings = {
  kerfThickness: number;
  weldingThickness: number;
  edgeTrimThickness: number;
  minGlassCutSize: number;
  useDynamicMinGlassCutSize: boolean;
  useCommonStockLength: boolean;
  commonStockLength: number;
  useCommonPrice: boolean;
  commonPricePerKg: number;
  stockLengths: Record<string, number>;
  pricePerKg: Record<string, number>;
  weightPerMeter: Record<string, number>;
  usableRemittanceThresholds: Record<string, number>;
  fixedNegligibleWasteLimit: Record<string, number>;
  profileDimensions: Record<string, any>;
  glassSettings: Record<string, GlassTypeConfig>;
  hardwareSettings: Record<string, { cost: number }>;
  seriesDeductions: Record<string, any>;
  gstPercentage: number; // GST percentage for quotations
  mandatoryGstByOptionId: Record<string, boolean>;
};

export type OptimizerPricingConfig = {
  trackOptionsMap: Record<string, TrackOption[]>;
  appSettings: OptimizerAppSettings;
};

const STORAGE_KEY = "optimizerPricingConfig.v1";

export const defaultOptimizerPricingConfig: OptimizerPricingConfig = {
  trackOptionsMap: {
    "Slider Eco Window": [
      { label: "2 Tracks (2 Glass Shutters)", value: 2, fullSeriesName: "Eco 2 Track" },
      { label: "2.5 Tracks (2 Glass, 1 Screen)", value: 2.5, fullSeriesName: "Eco 2.5 Track" },
    ],
    "Slider Standard Window": [
      { label: "2 Tracks (2 Glass Shutters)", value: 2, fullSeriesName: "Slider Standard Window 2 Track" },
      { label: "2.5 Tracks (2 Glass, 1 Screen)", value: 2.5, fullSeriesName: "Slider Standard Window 2.5 Track" },
      { label: "3 Tracks (3 Glass Shutters)", value: 3, fullSeriesName: "Slider Standard Window 3 Track" },
    ],
    "Slider Premium Window": [
      { label: "2 Tracks (2 Glass Shutters)", value: 2, fullSeriesName: "Slider Premium Window 2 Track" },
      { label: "2.5 Tracks (2 Glass, 1 Screen)", value: 2.5, fullSeriesName: "Slider Premium Window 2.5 Track" },
      { label: "3 Tracks (3 Glass Shutters)", value: 3, fullSeriesName: "Slider Premium Window 3 Track" },
    ],
    "Slider Standard Door": [
      { label: "2 Tracks (2 Glass Shutters)", value: 2, fullSeriesName: "Slider Standard Door 2 Track" },
      { label: "2.5 Tracks (2 Glass, 1 Screen)", value: 2.5, fullSeriesName: "Slider Standard Door 2.5 Track" },
      { label: "3 Tracks (3 Glass Shutters)", value: 3, fullSeriesName: "Slider Standard Door 3 Track" },
    ],
    "Slider Premium Door": [
      { label: "2 Tracks (2 Glass Shutters)", value: 2, fullSeriesName: "Slider Door Premium 2 Track" },
      { label: "2.5 Tracks (2 Glass, 1 Screen)", value: 2.5, fullSeriesName: "Slider Door Premium 2.5 Track" },
      { label: "3 Tracks (3 Glass Shutters)", value: 3, fullSeriesName: "Slider Door Premium 3 Track" },
      { label: "3.5 Tracks (2 Glass, 1 Screen)", value: 3.5, fullSeriesName: "Slider Door Premium 3.5 Track" },
    ],
  },
  appSettings: {
    kerfThickness: 15,
    weldingThickness: 2.5,
    edgeTrimThickness: 10,
    minGlassCutSize: 25,
    useDynamicMinGlassCutSize: true,
    useCommonStockLength: false,
    commonStockLength: 5900,
    useCommonPrice: false,
    commonPricePerKg: 100,
    stockLengths: {
      "beed 80": 5900,
      "beed 95": 5900,
      "frame 112 outer": 5900,
      "frame 55 outer": 5900,
      "frame 60 outer": 5900,
      "frame 80 outer": 5900,
      "frame 95 outer": 5900,
      "interlock 47x46 door": 5900,
      "sash 57x34": 5900,
      "sash 57x42": 5900,
      "sash 67x42": 5900,
      "sash 88x42": 5900,
      "interlock 80": 5900,
      "interlock window": 5900,
      "screen 50x24": 5900,
      "screen 65x24": 5900,
    },
    pricePerKg: {
      "beed 80": 100,
      "beed 95": 100,
      "frame 112 outer": 100,
      "frame 55 outer": 100,
      "frame 60 outer": 100,
      "frame 80 outer": 100,
      "frame 95 outer": 100,
      "interlock 47x46 door": 100,
      "interlock 80": 100,
      "interlock window": 100,
      "sash 57x34": 100,
      "sash 57x42": 100,
      "sash 67x42": 100,
      "sash 88x42": 100,
      "screen 50x24": 100,
      "screen 65x24": 100,
    },
    weightPerMeter: {
      "beed 80": 0.2095,
      "beed 95": 0.2585,
      "frame 112 outer": 1.676,
      "frame 55 outer": 0.8,
      "frame 60 outer": 1.029,
      "frame 80 outer": 1.187,
      "frame 95 outer": 1.35,
      "interlock 47x46 door": 0.257,
      "interlock 80": 0.179,
      "interlock window": 0.222,
      "sash 57x34": 0.7675,
      "sash 57x42": 0.8625,
      "sash 67x42": 0.9425,
      "sash 88x42": 1.2075,
      "screen 50x24": 0.531,
      "screen 65x24": 0.626,
    },
    usableRemittanceThresholds: {
      "beed 80": 300,
      "beed 95": 300,
      "frame 112 outer": 1100,
      "frame 55 outer": 100,
      "frame 60 outer": 750,
      "frame 80 outer": 750,
      "frame 95 outer": 750,
      "interlock 47x46 door": 1900,
      "interlock 80": 200,
      "interlock window": 300,
      "sash 57x34": 100,
      "sash 57x42": 200,
      "sash 67x42": 600,
      "sash 88x42": 600,
      "screen 50x24": 100,
      "screen 65x24": 200,
    },
    fixedNegligibleWasteLimit: {
      "beed 80": 100,
      "beed 95": 100,
      "frame 112 outer": 600,
      "frame 55 outer": 50,
      "frame 60 outer": 200,
      "frame 80 outer": 100,
      "frame 95 outer": 200,
      "interlock 47x46 door": 1000,
      "interlock 80": 200,
      "interlock window": 300,
      "sash 57x34": 100,
      "sash 57x42": 200,
      "sash 67x42": 200,
      "sash 88x42": 250,
      "screen 50x24": 100,
      "screen 65x24": 200,
    },
    profileDimensions: {
      "beed 80": { height: 20 },
      "beed 95": { height: 20 },
      "frame 112 outer": { height: 112 },
      "frame 55 outer": { height: 50 },
      "frame 60 outer": { height: 60 },
      "frame 80 outer": { height: 80 },
      "frame 95 outer": { height: 95 },
      "interlock 47x46 door": { height: 47 },
      "interlock 80": { height: 80 },
      "interlock window": { height: 47 },
      "sash 57x34": { height: 57 },
      "sash 57x42": { height: 57 },
      "sash 67x42": { height: 67 },
      "sash 88x42": { height: 88 },
      "screen 50x24": { height: 50 },
      "screen 65x24": { height: 65 },
    },
    glassSettings: {
      "5mm Clear Glass": {
        processingType: "In-House",
        purchaseMargin: 10,
        sheets: [{ id: 1, sheetWidth: 2440, sheetHeight: 1830, costPerSqFt: 50 }],
      },
      "6mm Toughened Glass": {
        processingType: "Outsourced",
        purchaseMargin: 15,
        sheets: [{ id: 1, sheetWidth: 2440, sheetHeight: 1830, costPerSqFt: 80 }],
      },
    },
    hardwareSettings: {
      Standard: { cost: 500 },
      Premium: { cost: 1200 },
    },
    seriesDeductions: {
      "Eco 2 Track": {
        sashLengthDeduction: 80,
        sashWidthOverlap: 50,
        interlockLengthDeduction: 80,
        beadingDeduction: 20,
        screenLengthDeduction: 0,
        frameProfile: "frame 55 outer",
        sashProfile: "sash 57x34",
        interlockProfile: "interlock 80",
        beadingProfile: "beed 80",
        screenProfile: "screen 50x24",
        glassSash: { widthDeduction: 10, sashHeightAdjustment: 10 },
        beading: { heightDeduction: 20, widthDeduction: 20 },
        interlockHeightDeduction: 80,
      },
      "Eco 2.5 Track": {
        sashLengthDeduction: 100,
        sashWidthOverlap: 50,
        interlockLengthDeduction: 100,
        beadingDeduction: 20,
        screenLengthDeduction: 100,
        frameProfile: "frame 80 outer",
        sashProfile: "sash 57x34",
        interlockProfile: "interlock 80",
        beadingProfile: "beed 80",
        screenProfile: "screen 50x24",
        glassSash: { widthDeduction: 10, sashHeightAdjustment: 10 },
        screenSash: { heightDeduction: 100, weightDeduction: 15 },
        beading: { heightDeduction: 20, weightDeduction: 20 },
        interlockHeightDeduction: 100,
      },
      "Slider Standard Window 2 Track": {
        sashLengthDeduction: 90,
        sashWidthOverlap: 50,
        interlockLengthDeduction: 90,
        beadingDeduction: 20,
        screenLengthDeduction: 0,
        frameProfile: "frame 60 outer",
        sashProfile: "sash 57x42",
        interlockProfile: "interlock window",
        beadingProfile: "beed 95",
        screenProfile: "screen 65x24",
        glassSash: { widthDeduction: 10, sashHeightAdjustment: 10 },
        beading: { heightDeduction: 20, weightDeduction: 20 },
        interlockHeightDeduction: 80,
      },
      "Slider Standard Window 2.5 Track": {
        sashLengthDeduction: 110,
        sashWidthOverlap: 50,
        interlockLengthDeduction: 110,
        beadingDeduction: 20,
        screenLengthDeduction: 110,
        frameProfile: "frame 95 outer",
        sashProfile: "sash 57x42",
        interlockProfile: "interlock window",
        beadingProfile: "beed 95",
        screenProfile: "screen 50x24",
        glassSash: { widthDeduction: 10, sashHeightAdjustment: 10 },
        screenSash: { heightDeduction: 100, weightDeduction: 15 },
        beading: { heightDeduction: 20, weightDeduction: 20 },
        interlockHeightDeduction: 100,
      },
      "Slider Standard Window 3 Track": {
        sashLengthDeduction: 90,
        sashWidthOverlap: 50,
        interlockLengthDeduction: 90,
        beadingDeduction: 20,
        screenLengthDeduction: 0,
        frameProfile: "frame 112 outer",
        sashProfile: "sash 57x42",
        interlockProfile: "interlock window",
        beadingProfile: "beed 95",
        screenProfile: "screen 65x24",
        glassSash: { widthDeduction: 10, sashHeightAdjustment: 10 },
        beading: { heightDeduction: 20, weightDeduction: 20 },
        interlockHeightDeduction: 100,
      },
      "Slider Premium Window 2 Track": {
        sashLengthDeduction: 90,
        sashWidthOverlap: 50,
        interlockLengthDeduction: 90,
        beadingDeduction: 20,
        screenLengthDeduction: 0,
        frameProfile: "frame 60 outer",
        sashProfile: "sash 67x42",
        interlockProfile: "interlock window",
        beadingProfile: "beed 95",
        screenProfile: "screen 65x24",
        glassSash: { widthDeduction: 10, sashHeightAdjustment: 10 },
        beading: { heightDeduction: 20, weightDeduction: 20 },
        interlockHeightDeduction: 80,
      },
      "Slider Premium Window 2.5 Track": {
        sashLengthDeduction: 110,
        sashWidthOverlap: 50,
        interlockLengthDeduction: 110,
        beadingDeduction: 20,
        screenLengthDeduction: 110,
        frameProfile: "frame 95 outer",
        sashProfile: "sash 67x42",
        interlockProfile: "interlock window",
        beadingProfile: "beed 95",
        screenProfile: "screen 50x24",
        glassSash: { widthDeduction: 10, sashHeightAdjustment: 10 },
        screenSash: { heightDeduction: 100, weightDeduction: 15 },
        beading: { heightDeduction: 20, weightDeduction: 20 },
        interlockHeightDeduction: 100,
      },
      "Slider Premium Window 3 Track": {
        sashLengthDeduction: 90,
        sashWidthOverlap: 50,
        interlockLengthDeduction: 90,
        beadingDeduction: 20,
        screenLengthDeduction: 0,
        frameProfile: "frame 112 outer",
        sashProfile: "sash 67x42",
        interlockProfile: "interlock 47x46 door",
        beadingProfile: "beed 95",
        screenProfile: "screen 65x24",
        glassSash: { widthDeduction: 10, sashHeightAdjustment: 10 },
        beading: { heightDeduction: 20, weightDeduction: 20 },
        interlockHeightDeduction: 100,
      },
      "Slider Standard Door 2 Track": {
        sashLengthDeduction: 90,
        sashWidthOverlap: 50,
        interlockLengthDeduction: 90,
        screenLengthDeduction: 0,
        frameProfile: "frame 60 outer",
        sashProfile: "sash 67x42",
        interlockProfile: "interlock 47x46 door",
        beadingProfile: "beed 95",
        screenProfile: "screen 50x24",
        glassSash: { widthDeduction: 10, weightDeduction: 20 },
        screenSash: { heightDeduction: 100, weightDeduction: 15 },
        beading: { heightDeduction: 20, weightDeduction: 20 },
        interlockHeightDeduction: 80,
      },
      "Slider Standard Door 2.5 Track": {
        sashLengthDeduction: 110,
        sashWidthOverlap: 50,
        interlockLengthDeduction: 110,
        screenLengthDeduction: 110,
        frameProfile: "frame 95 outer",
        sashProfile: "sash 67x42",
        interlockProfile: "interlock 47x46 door",
        beadingProfile: "beed 95",
        screenProfile: "screen 50x24",
        glassSash: { weightDeduction: 10, weightDeduction: 20 },
        screenSash: { heightDeduction: 100, weightDeduction: 15 },
        beading: { heightDeduction: 20, weightDeduction: 20 },
        interlockHeightDeduction: 100,
      },
      "Slider Standard Door 3 Track": {
        sashLengthDeduction: 90,
        sashWidthOverlap: 50,
        interlockLengthDeduction: 90,
        screenLengthDeduction: 0,
        frameProfile: "frame 112 outer",
        sashProfile: "sash 67x42",
        interlockProfile: "interlock 47x46 door",
        beadingProfile: "beed 95",
        screenProfile: "screen 50x24",
        glassSash: { weightDeduction: 10, weightDeduction: 20 },
        screenSash: { heightDeduction: 100, weightDeduction: 20 },
        beading: { heightDeduction: 20, weightDeduction: 20 },
        interlockHeightDeduction: 100,
      },
      "Slider Door Premium 2 Track": {
        sashLengthDeduction: 90,
        sashWidthOverlap: 50,
        interlockLengthDeduction: 90,
        screenLengthDeduction: 0,
        frameProfile: "frame 60 outer",
        sashProfile: "sash 88x42",
        interlockProfile: "interlock 47x46 door",
        beadingProfile: "beed 95",
        screenProfile: "screen 50x24",
        glassSash: { weightDeduction: 10, weightDeduction: 20 },
        screenSash: { heightDeduction: 100, weightDeduction: 15 },
        beading: { heightDeduction: 20, weightDeduction: 20 },
        interlockHeightDeduction: 80,
      },
      "Slider Door Premium 2.5 Track": {
        sashLengthDeduction: 110,
        sashWidthOverlap: 50,
        interlockLengthDeduction: 110,
        screenLengthDeduction: 110,
        frameProfile: "frame 95 outer",
        sashProfile: "sash 88x42",
        interlockProfile: "interlock 47x46 door",
        beadingProfile: "beed 95",
        screenProfile: "screen 50x24",
        glassSash: { weightDeduction: 10, weightDeduction: 20 },
        screenSash: { heightDeduction: 100, weightDeduction: 15 },
        beading: { heightDeduction: 20, weightDeduction: 20 },
        interlockHeightDeduction: 100,
      },
      "Slider Door Premium 3 Track": {
        sashLengthDeduction: 90,
        sashWidthOverlap: 50,
        interlockLengthDeduction: 90,
        screenLengthDeduction: 0,
        frameProfile: "frame 112 outer",
        sashProfile: "sash 88x42",
        interlockProfile: "interlock 47x46 door",
        beadingProfile: "beed 95",
        screenProfile: "screen 50x24",
        glassSash: { weightDeduction: 10, weightDeduction: 20 },
        screenSash: { heightDeduction: 100, weightDeduction: 20 },
        beading: { heightDeduction: 20, weightDeduction: 20 },
        interlockHeightDeduction: 100,
      },
      "Slider Door Premium 3.5 Track": {
        sashLengthDeduction: 110,
        sashWidthOverlap: 50,
        interlockLengthDeduction: 110,
        screenLengthDeduction: 110,
        frameProfile: "frame 112 outer",
        sashProfile: "sash 88x42",
        interlockProfile: "interlock 47x46 door",
        beadingProfile: "beed 95",
        screenProfile: "screen 50x24",
        glassSash: { weightDeduction: 10, weightDeduction: 20 },
        screenSash: { heightDeduction: 100, weightDeduction: 20 },
        beading: { heightDeduction: 20, weightDeduction: 20 },
        interlockHeightDeduction: 100,
      },
    },
    gstPercentage: 18, // Default GST percentage
    mandatoryGstByOptionId: {},
  }
};

const deepClone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const cloneOptimizerPricingConfig = (config: OptimizerPricingConfig) => deepClone(config);

export const getOptimizerPricingConfig = (): OptimizerPricingConfig => {
  if (typeof window === "undefined") {
    return deepClone(defaultOptimizerPricingConfig);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return deepClone(defaultOptimizerPricingConfig);
  }

  try {
    const parsed = JSON.parse(raw);
    const defaultAppSettings = deepClone(defaultOptimizerPricingConfig.appSettings);

    return {
      trackOptionsMap: parsed?.trackOptionsMap ?? deepClone(defaultOptimizerPricingConfig.trackOptionsMap),
      appSettings: {
        ...defaultAppSettings,
        ...(parsed?.appSettings ?? {}),
        stockLengths: { ...defaultAppSettings.stockLengths, ...(parsed?.appSettings?.stockLengths ?? {}) },
        pricePerKg: { ...defaultAppSettings.pricePerKg, ...(parsed?.appSettings?.pricePerKg ?? {}) },
        weightPerMeter: { ...defaultAppSettings.weightPerMeter, ...(parsed?.appSettings?.weightPerMeter ?? {}) },
        usableRemittanceThresholds: {
          ...defaultAppSettings.usableRemittanceThresholds,
          ...(parsed?.appSettings?.usableRemittanceThresholds ?? {}),
        },
        fixedNegligibleWasteLimit: {
          ...defaultAppSettings.fixedNegligibleWasteLimit,
          ...(parsed?.appSettings?.fixedNegligibleWasteLimit ?? {}),
        },
        profileDimensions: { ...defaultAppSettings.profileDimensions, ...(parsed?.appSettings?.profileDimensions ?? {}) },
        glassSettings: { ...defaultAppSettings.glassSettings, ...(parsed?.appSettings?.glassSettings ?? {}) },
        hardwareSettings: { ...defaultAppSettings.hardwareSettings, ...(parsed?.appSettings?.hardwareSettings ?? {}) },
        seriesDeductions: { ...defaultAppSettings.seriesDeductions, ...(parsed?.appSettings?.seriesDeductions ?? {}) },
        mandatoryGstByOptionId: {
          ...defaultAppSettings.mandatoryGstByOptionId,
          ...(parsed?.appSettings?.mandatoryGstByOptionId ?? {}),
        },
      },
    };
  } catch {
    return deepClone(defaultOptimizerPricingConfig);
  }
};

export const saveOptimizerPricingConfig = (config: OptimizerPricingConfig) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};
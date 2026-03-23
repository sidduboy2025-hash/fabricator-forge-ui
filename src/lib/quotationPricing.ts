import { OptimizerPricingConfig } from "@/lib/optimizerPricingConfig";
import { QuotationLineItem, QuotationOption } from "@/types/quotation";

const toCurrencyNumber = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Number(value.toFixed(2)));
};

export const buildQuotationOptionsFromConfig = (config: OptimizerPricingConfig): QuotationOption[] => {
  const profileOptions: QuotationOption[] = Object.keys(config.appSettings.stockLengths).map((profileName) => ({
    id: `profile:${profileName}`,
    label: `Profile - ${profileName}`,
    category: "profile",
    defaultUnitPrice: config.appSettings.useCommonPrice
      ? config.appSettings.commonPricePerKg
      : (config.appSettings.pricePerKg?.[profileName] || 0),
  }));

  const hardwareOptions: QuotationOption[] = Object.entries(config.appSettings.hardwareSettings).map(([name, value]) => ({
    id: `hardware:${name}`,
    label: `Hardware - ${name}`,
    category: "hardware",
    defaultUnitPrice: value?.cost || 0,
  }));

  const glassOptions: QuotationOption[] = Object.entries(config.appSettings.glassSettings).map(([name, value]) => ({
    id: `glass:${name}`,
    label: `Glass - ${name}`,
    category: "glass",
    defaultUnitPrice: value?.sheets?.[0]?.costPerSqFt || 0,
  }));

  const seriesOptions: QuotationOption[] = Object.entries(config.appSettings.seriesDeductions).map(([name, value]) => {
    const profiles = [
      value?.frameProfile,
      value?.sashProfile,
      value?.interlockProfile,
      value?.beadingProfile,
      value?.screenProfile,
    ].filter(Boolean);

    const derivedRate =
      profiles.length > 0
        ? profiles.reduce((sum, profileName) => {
            const profileRate = config.appSettings.useCommonPrice
              ? config.appSettings.commonPricePerKg
              : (config.appSettings.pricePerKg?.[profileName] || 0);
            return sum + profileRate;
          }, 0) / profiles.length
        : 0;

    return {
      id: `series:${name}`,
      label: `Series - ${name}`,
      category: "series",
      defaultUnitPrice: toCurrencyNumber(derivedRate),
    };
  });

  return [...profileOptions, ...hardwareOptions, ...glassOptions, ...seriesOptions];
};

export const recalculateLineItem = (item: QuotationLineItem): QuotationLineItem => {
  const quantity = Math.max(0, Number(item.quantity || 0));
  const unitPrice = toCurrencyNumber(item.unitPrice);
  return {
    ...item,
    quantity,
    unitPrice,
    totalPrice: toCurrencyNumber(quantity * unitPrice),
  };
};

export const calculateQuotationTotal = (lineItems: QuotationLineItem[]) => {
  const total = lineItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  return toCurrencyNumber(total);
};

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
import { Switch } from "@/components/ui/switch";
import { getOptimizerPricingConfig } from "@/lib/optimizerPricingConfig";
import {
  buildQuotationOptionsFromConfig,
  calculateQuotationTotal,
  recalculateLineItem,
} from "@/lib/quotationPricing";
import { QuotationLineItem, QuotationOptionCategory, QuotationRecord } from "@/types/quotation";
import { downloadQuotationPdf } from "@/lib/quotationPdf";

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
  const quotationOptions = useMemo(() => buildQuotationOptionsFromConfig(pricingConfig), [pricingConfig]);
  const quotationOptionById = useMemo(
    () => Object.fromEntries(quotationOptions.map((option) => [option.id, option])),
    [quotationOptions],
  );
  const optionCategories = useMemo(
    () => Array.from(new Set(quotationOptions.map((option) => option.category))),
    [quotationOptions],
  );

  const [clientName, setClientName] = useState(initialQuotation?.client || "");
  const [companyName, setCompanyName] = useState(initialQuotation?.company?.name || "");
  const [companyLogoDataUrl, setCompanyLogoDataUrl] = useState(initialQuotation?.company?.logoDataUrl || "");
  const [selectedCategory, setSelectedCategory] = useState(optionCategories[0] || "profile");
  const [selectedOptionId, setSelectedOptionId] = useState("");

  const filteredOptions = useMemo(
    () => quotationOptions.filter((option) => option.category === selectedCategory),
    [quotationOptions, selectedCategory],
  );

  useEffect(() => {
    const nextOptionId = filteredOptions[0]?.id || "";
    setSelectedOptionId(nextOptionId);
  }, [filteredOptions]);

  const [lineItems, setLineItems] = useState<QuotationLineItem[]>(initialQuotation?.lineItems || []);

  // Custom item state (for labour costs with quantity)
  const [customLabel, setCustomLabel] = useState("");
  const [customQuantity, setCustomQuantity] = useState("1");
  const [customUnitPrice, setCustomUnitPrice] = useState("");

  // Miscellaneous cost state (only label and cost, no quantity)
  const [miscLabel, setMiscLabel] = useState("");
  const [miscPrice, setMiscPrice] = useState("");

  // GST fields
  const [gstPercentage, setGstPercentage] = useState(initialQuotation?.gstPercentage ?? pricingConfig.appSettings.gstPercentage ?? 18);
  const [billWithGst, setBillWithGst] = useState(initialQuotation?.billWithGst ?? true);

  const resetForm = (quotation?: QuotationRecord) => {
    setClientName(quotation?.client || "");
    setCompanyName(quotation?.company?.name || "");
    setCompanyLogoDataUrl(quotation?.company?.logoDataUrl || "");
    setLineItems(quotation?.lineItems || []);
    setCustomLabel("");
    setCustomQuantity("1");
    setCustomUnitPrice("");
    setMiscLabel("");
    setMiscPrice("");
    setGstPercentage(quotation?.gstPercentage ?? pricingConfig.appSettings.gstPercentage ?? 18);
    setBillWithGst(quotation?.billWithGst ?? true);
  };

  useEffect(() => {
    if (open) {
      resetForm(initialQuotation);
    }
  }, [open, initialQuotation]);

  const addLineItem = () => {
    const option = quotationOptions.find((it) => it.id === selectedOptionId);
    if (!option) return;

    const lineItem: QuotationLineItem = {
      id: makeId(),
      optionId: option.id,
      label: option.label,
      category: option.category,
      quantity: 1,
      unitPrice: option.defaultUnitPrice,
      totalPrice: option.defaultUnitPrice,
      priceManuallyEdited: false,
      isMandatoryGst: option.isMandatoryGst,
      gstAmount: 0,
      gstApplied: false,
    };

    setLineItems((prev) => [...prev, lineItem]);
  };

  const addCustomLineItem = () => {
    const label = customLabel.trim();
    if (!label) return;

    const quantity = toNumber(customQuantity);
    const unitPrice = toNumber(customUnitPrice);
    if (quantity <= 0 || unitPrice <= 0) {
      return;
    }

    const lineItem: QuotationLineItem = {
      id: makeId(),
      optionId: "", // Indicates custom item
      label,
      category: "custom",
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
      priceManuallyEdited: true,
      isMandatoryGst: false,
      gstAmount: 0,
      gstApplied: false,
    };

    setLineItems((prev) => [...prev, lineItem]);
    setCustomLabel("");
    setCustomQuantity("1");
    setCustomUnitPrice("");
  };

  const addMiscLineItem = () => {
    const label = miscLabel.trim();
    if (!label) return;

    const unitPrice = toNumber(miscPrice);
    if (unitPrice <= 0) {
      return;
    }

    const lineItem: QuotationLineItem = {
      id: makeId(),
      optionId: "", // Indicates custom item
      label,
      category: "custom",
      quantity: 1, // Quantity is 1 for miscellaneous items
      unitPrice,
      totalPrice: unitPrice,
      priceManuallyEdited: true,
      isMandatoryGst: false,
      gstAmount: 0,
      gstApplied: false,
    };

    setLineItems((prev) => [...prev, lineItem]);
    setMiscLabel("");
    setMiscPrice("");
  };

  const removeLineItem = (lineItemId: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== lineItemId));
  };

  const updateLineQuantity = (lineItemId: string, value: string) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== lineItemId) return item;
        return recalculateLineItem({ ...item, quantity: toNumber(value) });
      }),
    );
  };

  const updateLineUnitPrice = (lineItemId: string, value: string) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== lineItemId) return item;
        return recalculateLineItem({ ...item, unitPrice: toNumber(value), priceManuallyEdited: true });
      }),
    );
  };

  const lineItemsWithGst = useMemo(() => {
    return lineItems.map((item) => {
      const option = item.optionId ? quotationOptionById[item.optionId] : undefined;
      const isMandatoryGst = option?.isMandatoryGst ?? item.isMandatoryGst ?? false;
      const gstApplied = isMandatoryGst || billWithGst;
      const gstAmount = gstApplied ? Number(((item.totalPrice || 0) * (gstPercentage / 100)).toFixed(2)) : 0;

      return {
        ...item,
        isMandatoryGst,
        gstApplied,
        gstAmount,
      };
    });
  }, [lineItems, quotationOptionById, billWithGst, gstPercentage]);

  // Calculate totals including GST
  const baseTotal = calculateQuotationTotal(lineItemsWithGst);
  const gstTotal = lineItemsWithGst.reduce((sum, item) => sum + (item.gstAmount || 0), 0);
  const grandTotal = baseTotal + gstTotal;

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

    const quotation: QuotationRecord = {
      id: `QUO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      client: clientName,
      date: getDate(0),
      validUntil: getDate(14),
      amount: baseTotal,
      gstAmount: gstTotal,
      totalAmount: grandTotal,
      status: "draft",
      itemsCount: lineItemsWithGst.length,
      company: {
        name: companyName,
        logoDataUrl: companyLogoDataUrl || undefined,
      },
      lineItems: lineItemsWithGst,
      gstPercentage,
      billWithGst,
    };

    onAdd(quotation);
    downloadQuotationPdf(quotation);

    setOpen(false);
    resetForm(initialQuotation);
  };

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

      <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || "Generate Quotation"}</DialogTitle>
          <DialogDescription>
            {description || "Items and base pricing come from your profile configuration. You can edit only pricing and quantities here."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label className="text-xs">Company Name For Header</Label>
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

          {/* GST Settings Section */}
          <div className="rounded-lg border p-4 space-y-4">
            <h4 className="text-sm font-semibold">GST Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div className="md:col-span-3 space-y-2">
                <Label className="text-xs">GST Percentage (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(toNumber(e.target.value))}
                  placeholder="Enter GST percentage"
                />
              </div>
              <div className="md:col-span-3 flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Bill with GST Invoice</p>
                  <p className="text-xs text-muted-foreground">If turned off, only mandatory GST products include GST.</p>
                </div>
                <Switch
                  checked={billWithGst}
                  onCheckedChange={(checked) => setBillWithGst(checked)}
                />
              </div>
            </div>
          </div>

          {/* Predefined Products Section */}
          <div className="rounded-lg border p-4 space-y-4">
            <h4 className="text-sm font-semibold">Add Products / Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
              <div className="md:col-span-3 space-y-2">
                <Label className="text-xs">Filter By Category</Label>
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as QuotationOptionCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {optionCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-7 space-y-2">
                <Label className="text-xs">Configured Option</Label>
                <Select value={selectedOptionId} onValueChange={setSelectedOptionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label} - Rs {option.defaultUnitPrice.toLocaleString("en-IN")}
                        {option.isMandatoryGst ? " (Mandatory GST)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" className="md:col-span-2" onClick={addLineItem} disabled={!selectedOptionId}>
                Add Option
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-2">Product</th>
                    <th className="text-left py-2 pr-2">Category</th>
                    <th className="text-left py-2 pr-2">Qty</th>
                    <th className="text-left py-2 pr-2">Unit Price</th>
                    <th className="text-left py-2 pr-2">Total</th>
                    <th className="text-left py-2 pr-2">GST</th>
                    <th className="text-left py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted-foreground py-6">
                        Add at least one product option.
                      </td>
                    </tr>
                  )}
                  {lineItemsWithGst.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2 pr-2">
                        {item.label}
                        {item.isMandatoryGst ? " (Mandatory GST)" : ""}
                      </td>
                      <td className="py-2 pr-2 capitalize">{item.category}</td>
                      <td className="py-2 pr-2">
                        <Input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => updateLineQuantity(item.id, e.target.value)}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateLineUnitPrice(item.id, e.target.value)}
                        />
                      </td>
                      <td className="py-2 pr-2 font-semibold">Rs {item.totalPrice.toLocaleString("en-IN")}</td>
                      <td className="py-2 pr-2">
                        {item.gstApplied ? (
                          <span className="text-xs text-muted-foreground">+ Rs {item.gstAmount.toLocaleString("en-IN")} GST</span>
                        ) : null}
                      </td>
                      <td className="py-2">
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeLineItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="rounded-md bg-accent px-4 py-3 text-sm font-semibold">
                Base Total: Rs {baseTotal.toLocaleString("en-IN")}
              </div>
              <div className="rounded-md bg-accent px-4 py-3 text-sm font-semibold ml-2">
                GST Total: Rs {gstTotal.toLocaleString("en-IN")}
              </div>
              <div className="rounded-md bg-accent px-4 py-3 text-sm font-semibold ml-2">
                Grand Total: Rs {grandTotal.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Custom Fields Section (with quantity) */}
          <div className="rounded-lg border p-4 space-y-4">
            <h4 className="text-sm font-semibold">Add Custom Fields (e.g., Labour Costs with Quantity)</h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
              <div className="md:col-span-4 space-y-2">
                <Label className="text-xs">Custom Label</Label>
                <Input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Enter custom label (e.g., Labour Cost)"
                />
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label className="text-xs">Unit Price</Label>
                <Input
                  type="number"
                  min="0"
                  value={customUnitPrice}
                  onChange={(e) => setCustomUnitPrice(e.target.value)}
                  placeholder="Enter unit price"
                />
              </div>
              <Button type="button" className="md:col-span-2" onClick={addCustomLineItem}>
                Add Custom Field
              </Button>
            </div>
          </div>

          {/* Miscellaneous Costs Section (without quantity) */}
          <div className="rounded-lg border p-4 space-y-4">
            <h4 className="text-sm font-semibold">Add Miscellaneous Costs (e.g., Labour Costs - Fixed Amount)</h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
              <div className="md:col-span-6 space-y-2">
                <Label className="text-xs">Cost Label</Label>
                <Input
                  value={miscLabel}
                  onChange={(e) => setMiscLabel(e.target.value)}
                  placeholder="Enter cost label (e.g., Labour Cost, Transportation, etc.)"
                />
              </div>
              <div className="md:col-span-4 space-y-2">
                <Label className="text-xs">Amount</Label>
                <Input
                  type="number"
                  min="0"
                  value={miscPrice}
                  onChange={(e) => setMiscPrice(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <Button type="button" className="md:col-span-2" onClick={addMiscLineItem}>
                Add Miscellaneous Cost
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!clientName || !companyName || lineItems.length === 0}>
              {submitLabel || "Generate Quotation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
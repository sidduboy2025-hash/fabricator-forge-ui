import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
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
}

export function CreateQuotationDialog({ onAdd }: CreateQuotationDialogProps) {
  const [open, setOpen] = useState(false);
  const pricingConfig = useMemo(() => getOptimizerPricingConfig(), []);
  const quotationOptions = useMemo(() => buildQuotationOptionsFromConfig(pricingConfig), [pricingConfig]);
  const optionCategories = useMemo(
    () => Array.from(new Set(quotationOptions.map((option) => option.category))),
    [quotationOptions],
  );

  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLogoDataUrl, setCompanyLogoDataUrl] = useState("");
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

  const [lineItems, setLineItems] = useState<QuotationLineItem[]>([]);

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
    };

    setLineItems((prev) => [...prev, lineItem]);
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

  const quotationTotal = calculateQuotationTotal(lineItems);

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
      amount: quotationTotal,
      status: "draft",
      itemsCount: lineItems.length,
      company: {
        name: companyName,
        logoDataUrl: companyLogoDataUrl || undefined,
      },
      lineItems,
    };

    onAdd(quotation);
    downloadQuotationPdf(quotation);

    setOpen(false);
    setClientName("");
    setCompanyName("");
    setCompanyLogoDataUrl("");
    setLineItems([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 text-xs h-8">
          <Plus className="h-4 w-4" />
          Create Quotation
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Quotation</DialogTitle>
          <DialogDescription>
            Items and base pricing come from your profile configuration. You can edit only pricing and quantities here.
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
                    <th className="text-left py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted-foreground py-6">
                        Add at least one product option.
                      </td>
                    </tr>
                  )}
                  {lineItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2 pr-2">{item.label}</td>
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
                Auto Calculated Total: Rs {quotationTotal.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!clientName || !companyName || lineItems.length === 0}>
              Generate Quotation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

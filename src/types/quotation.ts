export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected";

export type QuotationOptionCategory = "profile" | "hardware" | "glass" | "series" | "custom";

export interface QuotationOption {
  id: string;
  label: string;
  category: QuotationOptionCategory;
  defaultUnitPrice: number;
}

export interface QuotationLineItem {
  id: string;
  optionId: string;
  label: string;
  category: QuotationOptionCategory;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  priceManuallyEdited: boolean;
}

export interface QuotationCompany {
  name: string;
  logoDataUrl?: string;
}

export interface QuotationRecord {
  id: string;
  client: string;
  date: string;
  validUntil: string;
  amount: number;
  status: QuotationStatus;
  itemsCount: number;
  company: QuotationCompany;
  lineItems: QuotationLineItem[];
}

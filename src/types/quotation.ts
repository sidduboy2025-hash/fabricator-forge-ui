export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected";

export type QuotationOptionCategory = "profile" | "hardware" | "glass" | "series" | "custom";

export interface QuotationOption {
  id: string;
  label: string;
  category: QuotationOptionCategory;
  defaultUnitPrice: number;
  isMandatoryGst: boolean; // New field for mandatory GST flag
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
  isMandatoryGst: boolean;
  gstAmount: number; // New field for GST amount per line item
  gstApplied: boolean; // New field to track if GST was applied to this item
}

export interface QuotationCompany {
  name: string;
  logoDataUrl?: string;
}

export interface QuotationRecord {
  id: string;
  versionGroupId?: string;
  versionNumber?: number;
  previousVersionId?: string;
  client: string;
  date: string;
  validUntil: string;
  amount: number; // Base amount (before GST)
  gstAmount: number; // Total GST amount
  totalAmount: number; // Amount + GST
  status: QuotationStatus;
  itemsCount: number;
  company: QuotationCompany;
  lineItems: QuotationLineItem[];
  gstPercentage: number; // GST percentage from profile settings
  billWithGst: boolean; // Whether to bill with GST invoice
}
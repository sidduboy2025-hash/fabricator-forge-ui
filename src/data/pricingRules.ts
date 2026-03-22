export interface PricingRule {
  id: string;
  region: string;
  customerType: "retail" | "contractor" | "bulk";
  material: string;
  pricePerSft: number;
  margin: number;
  markup: number;
  isActive: boolean;
}

export const pricingRules: PricingRule[] = [
  { id: "PR-001", region: "South India", customerType: "retail", material: "Aluminium Sliding", pricePerSft: 85, margin: 22, markup: 28, isActive: true },
  { id: "PR-002", region: "South India", customerType: "contractor", material: "Aluminium Sliding", pricePerSft: 72, margin: 15, markup: 18, isActive: true },
  { id: "PR-003", region: "South India", customerType: "bulk", material: "Aluminium Sliding", pricePerSft: 65, margin: 10, markup: 12, isActive: true },
  { id: "PR-004", region: "North India", customerType: "retail", material: "Aluminium Sliding", pricePerSft: 90, margin: 24, markup: 30, isActive: true },
  { id: "PR-005", region: "North India", customerType: "contractor", material: "Aluminium Sliding", pricePerSft: 76, margin: 16, markup: 20, isActive: true },
  { id: "PR-006", region: "South India", customerType: "retail", material: "UPVC Casement", pricePerSft: 110, margin: 28, markup: 35, isActive: true },
  { id: "PR-007", region: "South India", customerType: "contractor", material: "UPVC Casement", pricePerSft: 95, margin: 20, markup: 25, isActive: true },
  { id: "PR-008", region: "West India", customerType: "retail", material: "Curtain Wall", pricePerSft: 145, margin: 30, markup: 40, isActive: true },
  { id: "PR-009", region: "West India", customerType: "bulk", material: "Curtain Wall", pricePerSft: 118, margin: 18, markup: 22, isActive: true },
  { id: "PR-010", region: "East India", customerType: "retail", material: "Aluminium Sliding", pricePerSft: 82, margin: 20, markup: 25, isActive: false },
  { id: "PR-011", region: "North India", customerType: "bulk", material: "Structural Glazing", pricePerSft: 135, margin: 22, markup: 28, isActive: true },
  { id: "PR-012", region: "South India", customerType: "retail", material: "Structural Glazing", pricePerSft: 155, margin: 32, markup: 42, isActive: true },
];

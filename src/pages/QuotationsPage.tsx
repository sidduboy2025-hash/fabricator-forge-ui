import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { QuotationList, Quotation } from "@/components/quotations/QuotationList";
import { CreateQuotationDialog } from "@/components/quotations/CreateQuotationDialog";

const initialQuotations: Quotation[] = [
  {
    id: "QUO-2026-041",
    client: "Vertex Infra Pvt Ltd",
    date: "2026-03-20",
    validUntil: "2026-04-03",
    amount: 1250000,
    status: "sent",
    itemsCount: 14,
  },
  {
    id: "QUO-2026-042",
    client: "Blue Sky Developers",
    date: "2026-03-21",
    validUntil: "2026-04-04",
    amount: 450000,
    status: "draft",
    itemsCount: 5,
  },
  {
    id: "QUO-2026-038",
    client: "Tech Park Phase 2",
    date: "2026-03-10",
    validUntil: "2026-03-24",
    amount: 3200000,
    status: "accepted",
    itemsCount: 42,
  },
  {
    id: "QUO-2026-035",
    client: "Residential Complex A1",
    date: "2026-03-01",
    validUntil: "2026-03-15",
    amount: 85000,
    status: "rejected",
    itemsCount: 3,
  },
];

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);

  const handleCreate = (newQuote: Quotation) => {
    setQuotations([newQuote, ...quotations]);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <PageHeader 
          title="Quotations" 
          description="Create, view, and manage client quotations." 
        />
        <CreateQuotationDialog onAdd={handleCreate} />
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Quotes</div>
          <div className="text-2xl font-bold">{quotations.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Accepted</div>
          <div className="text-2xl font-bold text-success">
            {quotations.filter(q => q.status === "accepted").length}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Pending Responses</div>
          <div className="text-2xl font-bold text-primary">
            {quotations.filter(q => q.status === "sent").length}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Win Rate</div>
          <div className="text-2xl font-bold">
            {Math.round((quotations.filter(q => q.status === "accepted").length / (quotations.filter(q => q.status !== "draft").length || 1)) * 100)}%
          </div>
        </div>
      </div>
      
      <QuotationList data={quotations} />
    </div>
  );
}

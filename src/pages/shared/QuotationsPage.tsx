import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { QuotationList } from "@/components/quotations/QuotationList";
import { CreateQuotationDialog } from "@/components/quotations/CreateQuotationDialog";
import { QuotationRecord } from "@/types/quotation";
import { downloadQuotationPdf } from "@/lib/quotationPdf";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StatusBadge } from "@/components/StatusBadge";
import { Download } from "lucide-react";

const STORAGE_KEY = "quotationHistory.v1";

const toClientGroupId = (client: string) => `client:${client.trim().toLowerCase().replace(/\s+/g, "-")}`;

const normalizeQuotation = (quotation: QuotationRecord): QuotationRecord => ({
  ...quotation,
  projectName: quotation.projectName ?? "",
  gstAmount: quotation.gstAmount ?? 0,
  totalAmount: quotation.totalAmount ?? quotation.amount,
  gstPercentage: quotation.gstPercentage ?? 0,
  billWithGst: quotation.billWithGst ?? false,
  windows: quotation.windows ?? [],
  versionGroupId: quotation.versionGroupId ?? toClientGroupId(quotation.client),
  versionNumber: quotation.versionNumber ?? 1,
});

const WindowDisplay = ({ width, height, numTracks }: { width: number; height: number; numTracks: number }) => {
  const maxWidth = 150;
  const maxHeight = 100;
  let displayWidth = 0;
  let displayHeight = 0;

  if (width > 0 && height > 0) {
    const aspectRatio = width / height;
    if (width > height) {
      displayWidth = maxWidth;
      displayHeight = maxWidth / aspectRatio;
      if (displayHeight > maxHeight) {
        displayHeight = maxHeight;
        displayWidth = maxHeight * aspectRatio;
      }
    } else {
      displayHeight = maxHeight;
      displayWidth = maxHeight * aspectRatio;
      if (displayWidth > maxWidth) {
        displayWidth = maxWidth;
        displayHeight = maxWidth / aspectRatio;
      }
    }
  }

  const sashCount = numTracks >= 3 ? 3 : 2;
  const sashWidthPercent = 100 / sashCount;

  return (
    <div className="flex items-center justify-center rounded-md border bg-card p-3 shadow-inner h-[145px]">
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
                className={`absolute inset-1 text-[8px] rounded-sm flex items-center justify-center ${
                  isMesh ? "bg-success/20 text-success" : "bg-primary/20 text-primary"
                }`}
              >
                {isMesh ? "Mesh" : "Glass"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const initialQuotations: QuotationRecord[] = [
  {
    id: "QUO-2026-041",
    versionGroupId: "client:vertex-infra-pvt-ltd",
    versionNumber: 1,
    projectName: "",
    client: "Vertex Infra Pvt Ltd",
    date: "2026-03-20",
    validUntil: "2026-04-03",
    amount: 1250000,
    gstAmount: 0,
    totalAmount: 1250000,
    status: "sent",
    itemsCount: 14,
    company: { name: "Acme Fabricators" },
    windows: [],
    lineItems: [],
    gstPercentage: 0,
    billWithGst: false,
  },
  {
    id: "QUO-2026-042",
    versionGroupId: "client:blue-sky-developers",
    versionNumber: 1,
    projectName: "",
    client: "Blue Sky Developers",
    date: "2026-03-21",
    validUntil: "2026-04-04",
    amount: 450000,
    gstAmount: 0,
    totalAmount: 450000,
    status: "draft",
    itemsCount: 5,
    company: { name: "Acme Fabricators" },
    windows: [],
    lineItems: [],
    gstPercentage: 0,
    billWithGst: false,
  },
  {
    id: "QUO-2026-038",
    versionGroupId: "client:tech-park-phase-2",
    versionNumber: 1,
    projectName: "",
    client: "Tech Park Phase 2",
    date: "2026-03-10",
    validUntil: "2026-03-24",
    amount: 3200000,
    gstAmount: 0,
    totalAmount: 3200000,
    status: "accepted",
    itemsCount: 42,
    company: { name: "Acme Fabricators" },
    windows: [],
    lineItems: [],
    gstPercentage: 0,
    billWithGst: false,
  },
  {
    id: "QUO-2026-035",
    versionGroupId: "client:residential-complex-a1",
    versionNumber: 1,
    projectName: "",
    client: "Residential Complex A1",
    date: "2026-03-01",
    validUntil: "2026-03-15",
    amount: 85000,
    gstAmount: 0,
    totalAmount: 85000,
    status: "rejected",
    itemsCount: 3,
    company: { name: "Acme Fabricators" },
    windows: [],
    lineItems: [],
    gstPercentage: 0,
    billWithGst: false,
  },
];

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationRecord[]>(() => {
    if (typeof window === "undefined") return initialQuotations;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialQuotations.map(normalizeQuotation);

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeQuotation) : initialQuotations.map(normalizeQuotation);
    } catch {
      return initialQuotations.map(normalizeQuotation);
    }
  });

  const [selectedQuotation, setSelectedQuotation] = useState<QuotationRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(quotations));
  }, [quotations]);

  const getVersionsForGroup = (versionGroupId?: string) => {
    if (!versionGroupId) return [];
    return quotations
      .filter((q) => q.versionGroupId === versionGroupId)
      .sort((a, b) => {
        const versionDiff = (b.versionNumber || 1) - (a.versionNumber || 1);
        if (versionDiff !== 0) return versionDiff;
        return b.date.localeCompare(a.date);
      });
  };

  const handleCreate = (newQuote: QuotationRecord) => {
    setQuotations((prev) => {
      const normalized = normalizeQuotation(newQuote);
      const versionGroupId = toClientGroupId(normalized.client);
      const existing = prev.filter((q) => q.versionGroupId === versionGroupId);
      const latest = existing.sort((a, b) => (b.versionNumber || 1) - (a.versionNumber || 1))[0];

      const withVersion: QuotationRecord = {
        ...normalized,
        versionGroupId,
        versionNumber: (latest?.versionNumber || 0) + 1,
        previousVersionId: latest?.id,
      };

      return [withVersion, ...prev];
    });
  };

  const handleRegenerate = (baseQuote: QuotationRecord, regeneratedQuote: QuotationRecord) => {
    setQuotations((prev) => {
      const normalized = normalizeQuotation(regeneratedQuote);
      const versionGroupId = baseQuote.versionGroupId || toClientGroupId(baseQuote.client);
      const existing = prev.filter((q) => q.versionGroupId === versionGroupId);
      const maxVersion = Math.max(0, ...existing.map((q) => q.versionNumber || 1));

      const newVersion: QuotationRecord = {
        ...normalized,
        versionGroupId,
        versionNumber: maxVersion + 1,
        previousVersionId: baseQuote.id,
      };

      setSelectedQuotation(newVersion);
      setIsDetailsOpen(true);
      return [newVersion, ...prev];
    });

    toast.success(`New quotation version generated for ${baseQuote.client}`);
  };

  const handleDownload = (quotation: QuotationRecord) => {
    downloadQuotationPdf(quotation);
  };

  const handleDuplicate = (quotation: QuotationRecord) => {
    const duplicate: QuotationRecord = {
      ...quotation,
      id: `QUO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      date: new Date().toISOString().split("T")[0],
      status: "draft",
      versionNumber: (quotation.versionNumber || 1) + 1,
      previousVersionId: quotation.id,
    };

    setQuotations((prev) => [duplicate, ...prev]);
    toast.success(`Quotation duplicated as ${duplicate.id}`);
  };

  const handleView = (quotation: QuotationRecord) => {
    setSelectedQuotation(quotation);
    setIsDetailsOpen(true);
  };

  const selectedVersions = selectedQuotation ? getVersionsForGroup(selectedQuotation.versionGroupId) : [];

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
      
      <QuotationList data={quotations} onDownload={handleDownload} onDuplicate={handleDuplicate} onView={handleView} />

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-y-auto">
          {selectedQuotation && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span>{selectedQuotation.id}</span>
                  <StatusBadge status={selectedQuotation.status as any} />
                </DialogTitle>
                <DialogDescription>
                  {selectedQuotation.client} • Project {selectedQuotation.projectName || "-"} • Amount Rs {selectedQuotation.totalAmount.toLocaleString("en-IN")} • Version V{selectedQuotation.versionNumber || 1}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap gap-2 justify-end">
                <Button variant="outline" onClick={() => handleDownload(selectedQuotation)}>
                  <Download className="h-4 w-4 mr-2" /> Download Current PDF
                </Button>
                <CreateQuotationDialog
                  initialQuotation={selectedQuotation}
                  onAdd={(quote) => handleRegenerate(selectedQuotation, quote)}
                  title="Edit and Regenerate Quotation"
                  description="Update this quotation and generate a new version. Previous versions are preserved."
                  submitLabel="Regenerate Quotation"
                  trigger={<Button>Edit & Regenerate</Button>}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Project</p>
                  <p className="font-medium">{selectedQuotation.projectName || "-"}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Client</p>
                  <p className="font-medium">{selectedQuotation.client}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedQuotation.date}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Valid Until</p>
                  <p className="font-medium">{selectedQuotation.validUntil}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="font-medium">Rs {selectedQuotation.totalAmount.toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Window Count</p>
                  <p className="font-medium">{selectedQuotation.windows.length}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Quotation Versions</h3>
                <Accordion type="single" collapsible defaultValue={selectedVersions[0]?.id} className="rounded-md border px-3">
                  {selectedVersions.map((version) => (
                    <AccordionItem key={version.id} value={version.id}>
                      <AccordionTrigger>
                        <div className="flex w-full items-center justify-between pr-3 text-left">
                          <div>
                            <p className="font-medium">V{version.versionNumber || 1} • {version.id}</p>
                            <p className="text-xs text-muted-foreground">{version.date} • {version.status.toUpperCase()}</p>
                          </div>
                          <p className="font-semibold">Rs {version.totalAmount.toLocaleString("en-IN")}</p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleDownload(version)}>
                            <Download className="h-4 w-4 mr-2" /> Download PDF
                          </Button>
                          <CreateQuotationDialog
                            initialQuotation={version}
                            onAdd={(quote) => handleRegenerate(version, quote)}
                            title="Edit and Regenerate Quotation"
                            description="Use this version as base and generate a new quotation version."
                            submitLabel="Regenerate Quotation"
                            trigger={<Button size="sm">Regenerate From This Version</Button>}
                          />
                        </div>

                        <div className="overflow-x-auto rounded-md border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-muted/30">
                                <th className="text-left p-2">Window</th>
                                <th className="text-left p-2">Drawing</th>
                                <th className="text-left p-2">Spec</th>
                                <th className="text-left p-2">Qty</th>
                                <th className="text-left p-2">Unit Cost</th>
                                <th className="text-left p-2">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {version.windows.length === 0 && (
                                <tr>
                                  <td className="p-2 text-muted-foreground" colSpan={6}>No window entries</td>
                                </tr>
                              )}
                              {version.windows.map((windowItem) => (
                                <tr key={windowItem.id} className="border-b align-top">
                                  <td className="p-2">
                                    <p className="font-medium">{windowItem.serialNumber}</p>
                                    <p className="text-xs text-muted-foreground">{windowItem.windowType}</p>
                                  </td>
                                  <td className="p-2 min-w-[180px]">
                                    <WindowDisplay
                                      width={windowItem.width}
                                      height={windowItem.height}
                                      numTracks={windowItem.numTracks}
                                    />
                                  </td>
                                  <td className="p-2">
                                    <p>{windowItem.width} x {windowItem.height} mm</p>
                                    <p className="text-xs text-muted-foreground">Series: {windowItem.series}</p>
                                    <p className="text-xs text-muted-foreground">Profile: {windowItem.profileColor}</p>
                                    <p className="text-xs text-muted-foreground">Glass: {windowItem.glassType}</p>
                                    <p className="text-xs text-muted-foreground">Mesh: {windowItem.meshType}</p>
                                    <p className="text-xs text-muted-foreground">Handle: {windowItem.handleType || "-"}</p>
                                  </td>
                                  <td className="p-2">{windowItem.quantity}</td>
                                  <td className="p-2">Rs {windowItem.unitCost.toLocaleString("en-IN")}</td>
                                  <td className="p-2 font-semibold">Rs {windowItem.totalCost.toLocaleString("en-IN")}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

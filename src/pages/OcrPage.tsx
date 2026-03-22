import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { FileUploadZone } from "@/components/FileUploadZone";
import { ocrFiles, OcrFile } from "@/data/ocrFiles";

const columns: Column<OcrFile>[] = [
  { key: "id", label: "ID", className: "font-mono text-xs w-24" },
  { key: "fileName", label: "File", sortable: true, render: (r) => <span className="font-medium text-xs">{r.fileName}</span> },
  { key: "fileType", label: "Type", render: (r) => <span className="uppercase text-xs">{r.fileType}</span> },
  { key: "validationStatus", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.validationStatus} /> },
  { key: "confidence", label: "Confidence", sortable: true, render: (r) => (
    r.confidence > 0 ? <span className={`tabular-nums text-xs font-medium ${r.confidence >= 80 ? "text-success" : r.confidence >= 60 ? "text-warning" : "text-destructive"}`}>{r.confidence}%</span> : <span className="text-xs text-muted-foreground">—</span>
  )},
  { key: "uploadDate", label: "Uploaded", sortable: true, render: (r) => <span className="text-xs">{new Date(r.uploadDate).toLocaleDateString("en-IN")}</span> },
];

export default function OcrPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="OCR Uploads" description="Upload drawings and documents for AI-assisted extraction" />
      <FileUploadZone accept=".pdf,.jpg,.jpeg,.png" />
      <DataTable columns={columns} data={ocrFiles} searchPlaceholder="Search files..." />
    </div>
  );
}

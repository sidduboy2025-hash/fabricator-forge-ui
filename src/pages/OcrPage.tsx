import { PageHeader } from "@/components/PageHeader";
import { ScanLine, UploadCloud, FileSearch, Ruler, ShieldAlert } from "lucide-react";

export default function OcrPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader 
        title="OCR / AI Input" 
        description="Automated document processing and AI-assisted extraction" 
      />
      
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card/50 border-dashed max-w-3xl mx-auto mt-8">
        <div className="bg-primary/10 p-4 rounded-full mb-6">
          <ScanLine className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">OCR Engine Coming Soon</h3>
        <p className="text-muted-foreground mb-8 max-w-md">
          We are upgrading our extraction engine. The new AI-assisted pipeline will be available in the next major update.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
          <div className="flex items-start gap-3 p-4 rounded-md bg-background border">
            <UploadCloud className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-sm">Image/PDF Upload</p>
              <p className="text-xs text-muted-foreground">Bulk upload architectural drawings and schedules.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-md bg-background border">
            <FileSearch className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-sm">OCR Extraction</p>
              <p className="text-xs text-muted-foreground">Automatic text recognition for BOM generation.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-md bg-background border">
            <Ruler className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-sm">AI Measurement Detection</p>
              <p className="text-xs text-muted-foreground">Smart parsing of dimensions and materials.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-md bg-background border">
            <ShieldAlert className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-sm">Validation & Error Handling</p>
              <p className="text-xs text-muted-foreground">Confidence scoring and manual review workflows.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

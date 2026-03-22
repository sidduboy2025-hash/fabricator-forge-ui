import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { useCallback, useState } from "react";

interface FileUploadZoneProps {
  onFiles?: (files: File[]) => void;
  accept?: string;
  className?: string;
}

export function FileUploadZone({ onFiles, accept, className }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    onFiles?.(files);
  }, [onFiles]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40",
        className
      )}
    >
      <Upload className="h-8 w-8 text-muted-foreground mb-3" />
      <p className="text-sm font-medium text-foreground">Drag & drop files here</p>
      <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
      <input
        type="file"
        accept={accept}
        multiple
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={(e) => onFiles?.(Array.from(e.target.files || []))}
        style={{ position: "relative", marginTop: 12, width: "auto" }}
      />
    </div>
  );
}

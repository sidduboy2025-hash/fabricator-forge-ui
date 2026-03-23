import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { Button } from "@/components/ui/button";
import { Copy, Download, Eye, MoreHorizontal, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { QuotationRecord } from "@/types/quotation";

interface QuotationListProps {
  data: QuotationRecord[];
  onDownload: (quotation: QuotationRecord) => void;
  onDuplicate: (quotation: QuotationRecord) => void;
  onView: (quotation: QuotationRecord) => void;
}

export function QuotationList({ data, onDownload, onDuplicate, onView }: QuotationListProps) {
  const handleAction = (action: string, id: string) => {
    toast.success(`${action} quotation ${id}`);
  };

  const columns: Column<QuotationRecord>[] = [
    { key: "id", label: "Quote ID", sortable: true, className: "font-mono text-xs w-24 text-primary" },
    { key: "client", label: "Client", sortable: true, render: (r) => <span className="font-medium">{r.client}</span> },
    { key: "date", label: "Date", sortable: true, className: "text-muted-foreground" },
    { key: "amount", label: "Amount", sortable: true, render: (r) => <CurrencyDisplay amount={r.amount} /> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status as any} /> },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="flex justify-end pr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(r)} className="text-xs">
                <Eye className="h-4 w-4 mr-2" /> View Details
              </DropdownMenuItem>
              {r.status === "draft" && (
                <DropdownMenuItem onClick={() => handleAction("Send to client", r.id)} className="text-xs text-primary">
                  <Send className="h-4 w-4 mr-2" /> Send to Client
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDownload(r)} className="text-xs">
                <Download className="h-4 w-4 mr-2" /> Download PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDuplicate(r)} className="text-xs">
                <Copy className="h-4 w-4 mr-2" /> Duplicate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} searchPlaceholder="Search quotations..." />;
}

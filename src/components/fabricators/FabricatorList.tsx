import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";

export interface Fabricator {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "pending";
  projectsCount: number;
  joinedAt: string;
}

interface FabricatorListProps {
  data: Fabricator[];
}

export function FabricatorList({ data }: FabricatorListProps) {
  const { setRole } = useRole();

  const handleAccessAccount = (fab: Fabricator) => {
    toast.success(`Accessing ${fab.company} account as Fabricator...`);
    // In a real app, this would get an impersonation token from the backend
    setRole("FABRICATOR");
    // Optionally redirect or refresh data
  };

  const columns: Column<Fabricator>[] = [
    { key: "id", label: "ID", sortable: true, className: "font-mono text-xs w-24" },
    { key: "company", label: "Company", sortable: true, render: (r) => <span className="font-medium">{r.company}</span> },
    { key: "name", label: "Owner Name", sortable: true },
    { key: "email", label: "Email", sortable: true, className: "text-muted-foreground" },
    { key: "projectsCount", label: "Projects", sortable: true, render: (r) => <span className="tabular-nums">{r.projectsCount}</span> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status as any} /> },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="flex justify-end pr-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs gap-1"
            onClick={(e) => {
              e.stopPropagation();
              handleAccessAccount(r);
            }}
          >
            Access <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} searchPlaceholder="Search fabricators by name or company..." />;
}

import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { projects, Project } from "@/data/projects";
import { Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const columns: Column<Project>[] = [
  { key: "id", label: "ID", sortable: true, className: "font-mono text-xs w-24" },
  { key: "name", label: "Project Name", sortable: true, render: (r) => <span className="font-medium">{r.name}</span> },
  { key: "client", label: "Client", sortable: true },
  { key: "sft", label: "Total SFT", sortable: true, render: (r) => <span className="tabular-nums">{r.sft.toLocaleString("en-IN")}</span> },
  { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  { key: "cost", label: "Cost Estimate", sortable: true, render: (r) => <CurrencyDisplay amount={r.cost} /> },
  { key: "progress", label: "Progress", sortable: true, render: (r) => (
    <div className="flex items-center gap-2 min-w-[100px]">
      <Progress value={r.progress} className="h-1.5 flex-1" />
      <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">{r.progress}%</span>
    </div>
  )},
];

export default function ProjectsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Projects"
        description="Manage fabrication projects and track progress"
        actions={[{ label: "New Project", icon: Plus }]}
      />
      <DataTable columns={columns} data={projects} selectable searchPlaceholder="Search projects..." />
    </div>
  );
}

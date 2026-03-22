import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { projects } from "@/data/projects";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Layers, Zap } from "lucide-react";

export default function BatchPage() {
  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "pending");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const selectedProjects = activeProjects.filter((p) => selected.has(p.id));
  const totalSft = selectedProjects.reduce((s, p) => s + p.sft, 0);
  const totalCost = selectedProjects.reduce((s, p) => s + p.cost, 0);
  const savings = Math.round(totalCost * 0.12);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Batch Processing" description="Optimize material usage across multiple projects" />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border bg-card p-5">
          <h3 className="text-sm font-medium mb-3">Select Projects</h3>
          <div className="space-y-2">
            {activeProjects.map((p) => (
              <label key={p.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer text-sm">
                <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggle(p.id)} />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{p.client}</span>
                </div>
                <span className="tabular-nums text-xs text-muted-foreground">{p.sft.toLocaleString()} SFT</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <MetricCard label="Total SFT" value={totalSft.toLocaleString("en-IN")} icon={Layers} />
          <MetricCard label="Combined Cost" value={`₹${totalCost.toLocaleString("en-IN")}`} />
          <MetricCard label="Estimated Savings" value={`₹${savings.toLocaleString("en-IN")}`} icon={Zap} trend={{ value: 12, label: "optimization" }} />
          <Button className="w-full" disabled={selected.size === 0}>
            Process {selected.size} Projects
          </Button>
        </div>
      </div>
    </div>
  );
}

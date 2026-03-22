import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { supplyChainEntities } from "@/data/supplyChain";
import { Network } from "lucide-react";

export default function SupplyChainPage() {
  const traders = supplyChainEntities.filter((e) => e.type === "trader");
  const distributors = supplyChainEntities.filter((e) => e.type === "distributor");
  const fabricators = supplyChainEntities.filter((e) => e.type === "fabricator");

  const EntityCard = ({ entity }: { entity: typeof supplyChainEntities[0] }) => (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{entity.name}</span>
        <StatusBadge status={entity.syncStatus} />
      </div>
      <div className="text-xs text-muted-foreground">{entity.location}</div>
      <div className="text-xs text-muted-foreground">
        Linked: {entity.linkedEntities.length} entities · Last sync: {new Date(entity.lastSync).toLocaleDateString("en-IN")}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Supply Chain" description="Visualize ecosystem relationships and data flow" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
            <Network className="h-3.5 w-3.5" /> Traders
          </h3>
          <div className="space-y-2">
            {traders.map((e) => <EntityCard key={e.id} entity={e} />)}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">Distributors</h3>
          <div className="space-y-2">
            {distributors.map((e) => <EntityCard key={e.id} entity={e} />)}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">Fabricators</h3>
          <div className="space-y-2">
            {fabricators.map((e) => <EntityCard key={e.id} entity={e} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

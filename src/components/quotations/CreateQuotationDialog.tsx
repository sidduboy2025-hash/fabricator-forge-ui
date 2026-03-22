import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";

export function CreateQuotationDialog({ onAdd }: { onAdd: (quote: any) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    client: "",
    amount: "0",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const validUntil = new Date(today);
    validUntil.setDate(validUntil.getDate() + 14); // 14 days validity

    onAdd({
      id: "QUO-" + Math.floor(Math.random() * 10000).toString().padStart(4, "0"),
      client: formData.client,
      date: today.toISOString().split("T")[0],
      validUntil: validUntil.toISOString().split("T")[0],
      amount: parseFloat(formData.amount) || 0,
      status: "draft",
      itemsCount: Math.floor(Math.random() * 5) + 1,
    });
    setOpen(false);
    setFormData({ client: "", amount: "0" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 text-xs h-8">
          <Plus className="h-4 w-4" />
          Create Quotation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Quotation</DialogTitle>
          <DialogDescription>
            Generate a new quotation for a client. You can add specific inventory items later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client" className="text-xs">Client Name</Label>
            <Input
              id="client"
              placeholder="e.g. Apex Builders Pvt Ltd"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className="h-8 text-xs"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="template" className="text-xs">Quotation Template</Label>
            <Select defaultValue="standard">
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard" className="text-xs">Standard fabrication (with glass)</SelectItem>
                <SelectItem value="labor" className="text-xs">Labor only</SelectItem>
                <SelectItem value="supply" className="text-xs">Supply only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount" className="text-xs">Estimated Total Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="1000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="h-8 text-xs font-mono"
            />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="h-8">Generate Draft</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

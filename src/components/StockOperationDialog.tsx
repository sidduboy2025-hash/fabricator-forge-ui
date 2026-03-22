import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { inventory } from "@/data/inventory";

export function StockOperationDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [item, setItem] = useState("");
  const [type, setType] = useState("in");
  const [qty, setQty] = useState("");
  const { toast } = useToast();

  const handleOperation = () => {
    if (!item || !qty) return;
    setStep(2);
    setTimeout(() => {
      const selectedItem = inventory.find(i => i.id === item);
      toast({
        title: "Stock Updated",
        description: `Successfully logged ${type === 'in' ? '+' : '-'}${qty} units for ${selectedItem?.itemName}.`,
      });
      setOpen(false);
      setStep(1);
      setItem("");
      setQty("");
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle>Log Stock Movement</DialogTitle>
              <DialogDescription>
                Manually record a stock-in or stock-out operation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="item">Inventory Item</Label>
                <Select value={item} onValueChange={setItem}>
                  <SelectTrigger id="item">
                    <SelectValue placeholder="Select item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>{inv.itemName} ({inv.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Operation Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">Stock In (+)</SelectItem>
                      <SelectItem value="out">Stock Out (-)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="qty">Quantity</Label>
                  <Input
                    id="qty"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    type="number"
                    placeholder="E.g. 50"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="ref">Reference (Optional)</Label>
                <Input id="ref" placeholder="PO Number / Manual Note" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleOperation} className="w-full" disabled={!item || !qty}>
                Confirm Operation
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-12 w-12 text-success animate-in zoom-in duration-300" />
            <h3 className="text-xl font-semibold">Processing...</h3>
            <p className="text-sm text-muted-foreground text-center">Updating inventory ledgers.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

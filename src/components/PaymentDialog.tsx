import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function PaymentDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState("10000");
  const { toast } = useToast();

  const handlePayment = () => {
    setStep(2);
    setTimeout(() => {
      toast({
        title: "Payment Successful",
        description: `Successfully added ₹${parseInt(amount).toLocaleString('en-IN')} credits to your wallet.`,
      });
      setOpen(false);
      setStep(1);
    }, 1500);
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
              <DialogTitle>Buy Credits</DialogTitle>
              <DialogDescription>
                Add credits to your wallet for Pay-per-SFT processing.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  placeholder="Enter amount"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="card">Card Details</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="card" placeholder="4242 4242 4242 4242" className="pl-9" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" type="password" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handlePayment} className="w-full">Pay ₹{parseInt(amount || "0").toLocaleString("en-IN")}</Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-12 w-12 text-success animate-in zoom-in duration-300" />
            <h3 className="text-xl font-semibold">Processing Payment...</h3>
            <p className="text-sm text-muted-foreground text-center">Please wait while we confirm your transaction.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

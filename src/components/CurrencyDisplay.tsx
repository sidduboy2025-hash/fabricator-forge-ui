import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
  compact?: boolean;
}

export function CurrencyDisplay({ amount, currency = "₹", className, compact }: CurrencyDisplayProps) {
  const formatted = compact
    ? amount >= 10000000
      ? `${(amount / 10000000).toFixed(2)} Cr`
      : amount >= 100000
        ? `${(amount / 100000).toFixed(2)} L`
        : amount >= 1000
          ? `${(amount / 1000).toFixed(1)}K`
          : amount.toString()
    : new Intl.NumberFormat("en-IN").format(amount);

  return (
    <span className={cn("tabular-nums", className)}>
      {currency}{formatted}
    </span>
  );
}

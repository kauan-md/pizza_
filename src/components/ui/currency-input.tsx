import { useState, type InputHTMLAttributes } from "react";

function parseBRL(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: string;
  onChange: (value: string) => void;
}

export function CurrencyInput({ value, onChange, className = "", ...props }: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);

  const numericValue = parseBRL(value);
  const displayValue = focused ? value : (numericValue > 0 ? formatBRL(numericValue) : "");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d,]/g, "");
    onChange(raw);
  }

  function handleBlur() {
    setFocused(false);
    if (numericValue > 0) {
      onChange(numericValue.toFixed(2).replace(".", ","));
    }
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
        R$
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={focused ? value : displayValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        className={`w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/50 ${className}`}
        {...props}
      />
    </div>
  );
}

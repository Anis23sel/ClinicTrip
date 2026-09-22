"use client";

import { BedDouble, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type Props = {
  onProceed: () => void;
};

export default function AccommodationInvoice({ onProceed }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
            <BedDouble size={22} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Invoice #CT-2402</p>
            <h3 className="mt-1 font-semibold">Accommodation</h3>
            <p className="mt-1 text-sm text-muted-foreground">Partner Hotel Premium · 5 nights</p>
          </div>
        </div>
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">Due</span>
      </div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="mt-5 flex w-full items-center justify-between border-t border-border pt-4 text-left text-sm font-medium hover:text-primary"
      >
        View invoice details
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
          <div className="flex justify-between gap-4 text-muted-foreground">
            <span>Single room · 5 nights</span>
            <span>$300.00</span>
          </div>
          <div className="flex justify-between gap-4 text-muted-foreground">
            <span>Breakfast package</span>
            <span>$75.00</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-3 font-semibold">
            <span>Total due now</span>
            <span>$375.00</span>
          </div>
          <button
            type="button"
            onClick={onProceed}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Proceed to payment
          </button>
        </div>
      )}
    </article>
  );
}
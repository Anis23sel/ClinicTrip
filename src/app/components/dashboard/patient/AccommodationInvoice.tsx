"use client";

import { BedDouble, ChevronDown, ChevronUp, Download } from "lucide-react";
import { useState } from "react";

type Props = {
  onProceed: () => void;
  onDownload: () => void;
};

export default function AccommodationInvoice({ onProceed, onDownload }: Props) {
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
        <div className="text-right">
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">Due</span>
          <p className="mt-3 text-lg font-bold">€375.00</p>
          <p className="text-xs text-muted-foreground">due now</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="mt-5 flex w-full items-center justify-between border-t border-border pt-4 text-left text-sm font-medium hover:text-primary"
      >
        <span>{open ? "Hide invoice details" : "View invoice details"}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
          <div className="flex justify-between gap-4 text-muted-foreground">
            <span>Single room · 5 nights</span>
            <span>€300.00</span>
          </div>
          <div className="flex justify-between gap-4 text-muted-foreground">
            <span>Breakfast package</span>
            <span>€75.00</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-3 font-semibold">
            <span>Total due now</span>
            <span>€375.00</span>
          </div>
          <button
            type="button"
            onClick={onProceed}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Proceed to payment
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Download size={16} /> Download invoice PDF
          </button>
        </div>
      )}
    </article>
  );
}
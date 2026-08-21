"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import type { DateRange } from "./searchTypes";

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

interface SearchDateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export default function SearchDateRangePicker({ value, onChange }: SearchDateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, useCallback(() => setOpen(false), []));

  const today = new Date().toISOString().split("T")[0];
  const label = value.from && value.to
    ? `${value.from} -> ${value.to}`
    : value.from
      ? `From ${value.from}`
      : "Select dates";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="h-full w-full min-w-[190px] px-3 py-3 bg-input-background rounded-lg border border-border flex items-center gap-2 text-sm hover:border-primary transition-colors"
      >
        <Calendar size={16} className="text-muted-foreground shrink-0" />
        <span className={value.from ? "" : "text-muted-foreground"}>{label}</span>
        <ChevronDown size={14} className="ml-auto text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-30 top-full mt-1 left-0 bg-card border border-border rounded-xl shadow-xl p-4 min-w-[280px]">
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Travel window</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">From</label>
              <input
                type="date"
                value={value.from}
                min={today}
                onChange={(event) => onChange({ from: event.target.value, to: value.to && event.target.value > value.to ? "" : value.to })}
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">To</label>
              <input
                type="date"
                value={value.to}
                min={value.from || today}
                onChange={(event) => { onChange({ ...value, to: event.target.value }); setOpen(false); }}
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          {(value.from || value.to) && (
            <button onClick={() => { onChange({ from: "", to: "" }); setOpen(false); }} className="mt-3 text-xs text-muted-foreground hover:text-destructive transition-colors">
              Clear dates
            </button>
          )}
        </div>
      )}
    </div>
  );
}

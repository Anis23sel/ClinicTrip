"use client";

import { useState } from "react";
import FinalDateRangePicker from "./FinalDateRangePicker";
import type { DateRange } from "../../search/searchTypes";

export type BookingFiltersValue = {
  name: string;
  surgery: string;
  dates: DateRange;
};

export default function BookingFilters({
  value,
  onChange,
  resultCount,
  availableSurgeries,
}: {
  value: BookingFiltersValue;
  onChange: (value: BookingFiltersValue) => void;
  resultCount: number;
  availableSurgeries: string[];
}) {
  const [surgeryOpen, setSurgeryOpen] = useState(false);
  const hasFilters = Boolean(value.name || value.surgery || value.dates.from || value.dates.to);
  const matchingSurgeries = availableSurgeries
    .filter((surgery) => surgery.toLowerCase().includes(value.surgery.trim().toLowerCase()))
    .slice(0, value.surgery.trim() ? availableSurgeries.length : 4);

  const clearFilters = () => {
    onChange({ name: "", surgery: "", dates: { from: "", to: "" } });
  };

  return (
    <div className="mb-5 rounded-lg border border-border bg-card p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="text-sm font-medium">
          Patient name
          <input
            type="search"
            value={value.name}
            onChange={(event) => onChange({ ...value, name: event.target.value })}
            placeholder="Search by patient name"
            className="mt-1.5 w-full rounded-lg border border-border bg-input-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <div className="relative text-sm font-medium">
          Surgery or procedure
          <input
            type="search"
            value={value.surgery}
            onFocus={() => setSurgeryOpen(true)}
            onChange={(event) => {
              onChange({ ...value, surgery: event.target.value });
              setSurgeryOpen(true);
            }}
            placeholder="Search by surgery"
            aria-label="Search by surgery or procedure"
            className="mt-1.5 w-full rounded-lg border border-border bg-input-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring"
          />
          {surgeryOpen && matchingSurgeries.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border bg-card p-1 shadow-lg">
              {matchingSurgeries.map((surgery) => (
                <button
                  key={surgery}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange({ ...value, surgery });
                    setSurgeryOpen(false);
                  }}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm font-normal hover:bg-muted"
                >
                  {surgery}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            clearFilters();
            setSurgeryOpen(false);
          }}
          disabled={!hasFilters}
          className="rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear filters
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-[280px]">
          <FinalDateRangePicker
            startDate={value.dates.from}
            endDate={value.dates.to}
            title="Requested date range"
            onChange={(dates) => onChange({ ...value, dates: { from: dates.startDate, to: dates.endDate } })}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {resultCount} {resultCount === 1 ? "request" : "requests"} found
        </p>
      </div>
    </div>
  );
}

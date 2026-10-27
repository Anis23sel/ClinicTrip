"use client";

import FinalDateRangePicker from "@/app/components/dashboard/clinic/FinalDateRangePicker";
import type { DateRange } from "react-day-picker";

interface ClinicDatePickerProps {
  dateRange: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}

function toDateString(date: Date | undefined) {
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function fromDateString(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function ClinicDatePicker({ dateRange, onChange }: ClinicDatePickerProps) {
  return (
    <section className="space-y-2">
      <label className="block text-sm font-medium">Dates</label>
      <FinalDateRangePicker
        startDate={toDateString(dateRange?.from)}
        endDate={toDateString(dateRange?.to)}
        onChange={({ startDate, endDate }) => {
          const from = fromDateString(startDate);
          const to = fromDateString(endDate);
          onChange(from || to ? { from, to } : undefined);
        }}
        title="Travel window"
      />
    </section>
  );
}

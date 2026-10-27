"use client";

import FinalDateRangePicker from "@/app/components/dashboard/clinic/FinalDateRangePicker";
import type { DateRange } from "./searchTypes";

interface SearchDateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export default function SearchDateRangePicker({ value, onChange }: SearchDateRangePickerProps) {
  return (
    <FinalDateRangePicker
      startDate={value.from}
      endDate={value.to}
      onChange={({ startDate, endDate }) => onChange({ from: startDate, to: endDate })}
      title="Travel window"
    />
  );
}

import type { CSSProperties } from "react";
import { DayPicker, type DateRange } from "react-day-picker";

interface ClinicDatePickerProps { dateRange: DateRange | undefined; onChange: (range: DateRange | undefined) => void; }

export default function ClinicDatePicker({ dateRange, onChange }: ClinicDatePickerProps) {
  return (
    <section className="space-y-4">
      <label className="block text-sm font-medium">Dates</label>
      <div className="rounded-lg border border-border bg-input-background p-3 sm:p-4">
        <div className="overflow-x-auto">
          <DayPicker mode="range" selected={dateRange} onSelect={onChange} disabled={{ before: new Date() }} numberOfMonths={2} pagedNavigation captionLayout="dropdown" className="clinic-calendar mx-auto" style={{ "--rdp-accent-color": "#391419", "--rdp-accent-background-color": "rgba(57, 20, 25, 0.12)", "--rdp-range_start-color": "#ffffff", "--rdp-range_end-color": "#ffffff", "--rdp-range_middle-color": "#391419", "--rdp-range_middle-background-color": "rgba(57, 20, 25, 0.12)", "--rdp-selected-border": "1px solid #391419" } as CSSProperties} styles={{ months: { display: "flex", flexDirection: "row", gap: "1.5rem", justifyContent: "center", alignItems: "flex-start" }, month: { margin: 0 } }} modifiersStyles={{ range_start: { backgroundColor: "#391419", color: "#ffffff", borderRadius: "9999px" }, range_end: { backgroundColor: "#391419", color: "#ffffff", borderRadius: "9999px" }, range_middle: { backgroundColor: "rgba(57, 20, 25, 0.12)", color: "#391419", borderRadius: 0 }, selected: { backgroundColor: "#391419", color: "#ffffff", borderRadius: "9999px" } }} />
        </div>
      </div>
    </section>
  );
}
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

export default function FinalDateRangePicker({
  startDate,
  endDate,
  onChange,
  disabled,
  title = "Final procedure dates",
}: {
  startDate: string;
  endDate: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
  disabled?: boolean;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = formatDate(today);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = startDate ? parseDate(startDate) : null;
    return date
      ? new Date(date.getFullYear(), date.getMonth(), 1)
      : new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const closePicker = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        closePicker();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [closePicker]);

  const handleOpen = () => {
    if (disabled) return;
    const date = startDate ? parseDate(startDate) : null;
    if (date) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    setOpen((current) => !current);
  };

  const previousMonth = () => {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );
    const minimumMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (nextMonth >= minimumMonth) setCurrentMonth(nextMonth);
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (date: Date) => {
    const dateString = formatDate(date);
    if (dateString < todayString) return;

    if (!startDate || endDate) {
      onChange({ startDate: dateString, endDate: "" });
      return;
    }

    if (dateString < startDate) {
      onChange({ startDate: dateString, endDate: "" });
      return;
    }

    onChange({ startDate, endDate: dateString });
    setOpen(false);
  };

  const handleClear = () => {
    onChange({ startDate: "", endDate: "" });
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setOpen(false);
  };

  const label = startDate && endDate
    ? `${startDate} -> ${endDate}`
    : startDate
      ? `From ${startDate}`
      : "Select dates";
  const days = getCalendarDays(currentMonth);
  const isCurrentMonth = (date: Date) =>
    date.getMonth() === currentMonth.getMonth() &&
    date.getFullYear() === currentMonth.getFullYear();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className="flex h-full w-full min-w-[190px] items-center gap-2 rounded-lg border border-border bg-input-background px-3 py-3 text-sm transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Calendar size={16} className="shrink-0 text-muted-foreground" />
        <span className={startDate ? "" : "text-muted-foreground"}>{label}</span>
        <ChevronDown size={14} className="ml-auto text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-[320px] rounded-xl border border-border bg-card p-4 shadow-xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={previousMonth}
              disabled={
                currentMonth.getFullYear() === today.getFullYear() &&
                currentMonth.getMonth() === today.getMonth()
              }
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span className="text-lg">&#8249;</span>
            </button>
            <p className="text-sm font-semibold">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span className="text-lg">&#8250;</span>
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-1 text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {days.map((date, index) => {
              const dateString = formatDate(date);
              const current = isCurrentMonth(date);
              const past = dateString < todayString;
              const isStart = dateString === startDate;
              const isEnd = dateString === endDate;
              const inRange = !!startDate && !!endDate && dateString > startDate && dateString < endDate;
              const isToday = dateString === todayString;
              return (
                <button
                  key={`${dateString}-${index}`}
                  type="button"
                  disabled={past || !current}
                  onClick={() => handleDateClick(date)}
                  className={`relative flex h-9 items-center justify-center text-sm transition-colors ${!current ? "text-muted-foreground/30" : ""} ${past ? "cursor-not-allowed text-muted-foreground/30" : ""} ${inRange ? "bg-primary/10 text-foreground" : ""} ${isStart || isEnd ? "bg-primary font-medium text-primary-foreground" : ""} ${!past && current && !isStart && !isEnd && !inRange ? "hover:bg-muted" : ""} ${isToday && !isStart && !isEnd ? "font-semibold ring-1 ring-inset ring-primary" : ""}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <DateSummary label="From" value={startDate} />
            <DateSummary label="To" value={endDate} />
          </div>
          {(startDate || endDate) && (
            <button type="button" onClick={handleClear} className="mt-3 text-xs text-muted-foreground hover:text-destructive">
              Clear dates
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DateSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2 flex items-center justify-between text-xs first:mt-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={value ? "font-medium" : "text-muted-foreground"}>{value || "Select date"}</span>
    </div>
  );
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
}

function getCalendarDays(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, monthIndex, 0).getDate();
  const days: Date[] = [];

  for (let index = firstWeekday - 1; index >= 0; index--) {
    days.push(new Date(year, monthIndex - 1, daysInPreviousMonth - index));
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, monthIndex, day));
  }
  for (let day = 1; days.length < 42; day++) {
    days.push(new Date(year, monthIndex + 1, day));
  }
  return days;
}

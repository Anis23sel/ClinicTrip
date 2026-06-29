"use client";

import { useState } from "react";
import { Plane, X } from "lucide-react";

export default function Banner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative flex items-center justify-center gap-3 bg-primary px-4 py-2 text-sm text-primary-foreground">
      <Plane size={15} className="shrink-0 opacity-80" />

      <span className="text-center">
        Medical tourism made simple — compare clinics, book procedures, and
        travel with confidence.
        <span className="ml-2 cursor-pointer underline underline-offset-2 opacity-90">
          Learn more
        </span>
      </span>

      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 transition-opacity hover:opacity-100"
        aria-label="Dismiss banner"
      >
        <X size={14} />
      </button>
    </div>
  );
}
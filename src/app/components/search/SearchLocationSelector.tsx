"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

interface SearchLocationSelectorProps {
  city: string;
  cities: string[];
  onCityChange: (city: string) => void;
}

export default function SearchLocationSelector({ city, cities, onCityChange }: SearchLocationSelectorProps) {
  const [openCity, setOpenCity] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);
  useOutsideClick(cityRef, useCallback(() => setOpenCity(false), []));

  return (
    <div className="relative" ref={cityRef}>
          <button
            type="button"
            onClick={() => setOpenCity((current) => !current)}
            className="h-full min-w-[130px] px-3 py-3 bg-input-background rounded-lg border border-border flex items-center gap-2 text-sm hover:border-primary transition-colors"
          >
            <MapPin size={15} className="text-muted-foreground shrink-0" />
            <span className={city ? "" : "text-muted-foreground"}>{city || "City"}</span>
            <ChevronDown size={13} className="ml-auto text-muted-foreground" />
          </button>

          {openCity && (
            <div className="absolute z-30 top-full mt-1 left-0 w-52 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
              <button onClick={() => { onCityChange(""); setOpenCity(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors text-muted-foreground">
                All cities
              </button>
              {cities.map((cityOption) => (
                <button
                  key={cityOption}
                  onClick={() => { onCityChange(cityOption); setOpenCity(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${city === cityOption ? "bg-primary/10 text-primary font-medium" : ""}`}
                >
                  {cityOption}
                </button>
              ))}
            </div>
          )}
        </div>
  
  );
}

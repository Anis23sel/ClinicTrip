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
  country: string;
  city: string;
  countryCities: Record<string, string[]>;
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
}

export default function SearchLocationSelector({ country, city, countryCities, onCountryChange, onCityChange }: SearchLocationSelectorProps) {
  const [openCountry, setOpenCountry] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  useOutsideClick(countryRef, useCallback(() => setOpenCountry(false), []));
  useOutsideClick(cityRef, useCallback(() => setOpenCity(false), []));
  const cities = country ? countryCities[country] || [] : [];

  return (
    <div className="flex gap-2">
      <div className="relative" ref={countryRef}>
        <button
          type="button"
          onClick={() => { setOpenCountry((current) => !current); setOpenCity(false); }}
          className="h-full min-w-[140px] px-3 py-3 bg-input-background rounded-lg border border-border flex items-center gap-2 text-sm hover:border-primary transition-colors"
        >
          <MapPin size={15} className="text-muted-foreground shrink-0" />
          <span className={country ? "" : "text-muted-foreground"}>{country || "Country"}</span>
          <ChevronDown size={13} className="ml-auto text-muted-foreground" />
        </button>

        {openCountry && (
          <div className="absolute z-30 top-full mt-1 left-0 w-52 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
            <button onClick={() => { onCountryChange(""); onCityChange(""); setOpenCountry(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors text-muted-foreground">
              All countries
            </button>
            {Object.keys(countryCities).map((countryOption) => (
              <button
                key={countryOption}
                onClick={() => { onCountryChange(countryOption); onCityChange(""); setOpenCountry(false); setOpenCity(true); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${country === countryOption ? "bg-primary/10 text-primary font-medium" : ""}`}
              >
                {countryOption}
              </button>
            ))}
          </div>
        )}
      </div>

      {country && (
        <div className="relative" ref={cityRef}>
          <button
            type="button"
            onClick={() => { setOpenCity((current) => !current); setOpenCountry(false); }}
            className="h-full min-w-[130px] px-3 py-3 bg-input-background rounded-lg border border-border flex items-center gap-2 text-sm hover:border-primary transition-colors"
          >
            <span className={city ? "" : "text-muted-foreground"}>{city || "All cities"}</span>
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
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin, Search } from "lucide-react";

function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void
) {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);

    return () =>
      document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

interface SearchLocationSelectorProps {
  city: string;
  cities: string[];
  onCityChange: (city: string) => void;
}

function normalizeCitySearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase();
}

export default function SearchLocationSelector({
  city,
  cities,
  onCityChange,
}: SearchLocationSelectorProps) {
  const [openCity, setOpenCity] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  const cityRef = useRef<HTMLDivElement>(null);

  useOutsideClick(
    cityRef,
    useCallback(() => setOpenCity(false), [])
  );

  const normalizedCitySearch = normalizeCitySearch(citySearch);
  const filteredCities = normalizedCitySearch
    ? cities.filter((cityOption) =>
        normalizeCitySearch(cityOption).includes(normalizedCitySearch)
      )
    : cities;

  const handleCitySelect = (selectedCity: string) => {
    onCityChange(selectedCity);
    setCitySearch("");
    setOpenCity(false);
  };

  const handleOpen = () => {
    setOpenCity((current) => !current);
    setCitySearch("");
  };

  return (
    <div
      className="relative"
      ref={cityRef}
    >
      {/* City button */}

      <button
        type="button"
        onClick={handleOpen}
        className="h-full min-w-[130px] px-3 py-3 bg-input-background rounded-lg border border-border flex items-center gap-2 text-sm hover:border-primary transition-colors"
      >
        <MapPin
          size={15}
          className="text-muted-foreground shrink-0"
        />

        <span
          className={
            city ? "" : "text-muted-foreground"
          }
        >
          {city || "City"}
        </span>

        <ChevronDown
          size={13}
          className="ml-auto text-muted-foreground"
        />
      </button>

      {/* Dropdown */}

      {openCity && (
        <div className="absolute z-30 top-full mt-1 left-0 w-64 bg-card border border-border rounded-xl shadow-xl overflow-hidden">

          {/* Search input */}

          <div className="p-2 border-b border-border">
            <div className="relative">

              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="text"
                value={citySearch}
                onChange={(e) =>
                  setCitySearch(e.target.value)
                }
                placeholder="Search city..."
                autoFocus
                className="w-full pl-9 pr-3 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />

            </div>
          </div>

          {/* Cities */}

          <div className="max-h-64 overflow-y-auto">

            {/* All cities */}

            {!normalizedCitySearch && (
              <button
                type="button"
                onClick={() => handleCitySelect("")}
                className={`w-full border-b border-border px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                  city ? "text-muted-foreground" : "bg-primary/10 font-medium text-primary"
                }`}
              >
                All cities
              </button>
            )}

            {/* Filtered cities */}

            {filteredCities.length > 0 ? (
              filteredCities.map((cityOption) => (
                <button
                  key={cityOption}
                  type="button"
                  onClick={() =>
                    handleCitySelect(cityOption)
                  }
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                    city === cityOption
                      ? "bg-primary/10 text-primary font-medium"
                      : ""
                  }`}
                >
                  {cityOption}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                No cities found.
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

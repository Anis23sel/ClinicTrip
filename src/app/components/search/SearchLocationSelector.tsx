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

  /*
   * Show only 4 cities initially.
   *
   * When the user starts typing, search through
   * the complete list of available cities.
   */
  const filteredCities = citySearch.trim()
    ? cities.filter((cityOption) =>
        cityOption
          .toLowerCase()
          .includes(citySearch.trim().toLowerCase())
      )
    : cities.slice(0, 4);

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

            {!citySearch.trim() && (
              <button
                type="button"
                onClick={() => handleCitySelect("")}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors text-muted-foreground"
              >
                
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

"use client";
import { useState, useRef, useEffect, useCallback, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Star, MapPin, DollarSign, ChevronDown, Calendar, X } from "lucide-react";
import  BodyPartSelector from "../components/search/BodyPartSelector";

// ── Helpers ──────────────────────────────────────────────────────────────────

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

// ── Data ──────────────────────────────────────────────────────────────────────

const countryCities: Record<string, string[]> = {
  Turkey: ["Istanbul", "Ankara", "Izmir", "Antalya", "Bursa", "Adana", "Gaziantep", "Konya", "Mersin", "Mugla / Bodrum", "Trabzon", "Kayseri", "Eskisehir", "Samsun"],
  Thailand: ["Bangkok", "Phuket", "Chiang Mai", "Pattaya"],
  Mexico: ["Mexico City", "Cancun", "Monterrey", "Guadalajara", "Tijuana"],
  Tunisia: ["Tunis", "Sousse", "Sfax", "Monastir"],
  Hungary: ["Budapest", "Debrecen", "Pécs"],
  Colombia: ["Bogotá", "Medellín", "Cali", "Cartagena"],
  India: ["Mumbai", "Delhi", "Chennai", "Bangalore", "Hyderabad"],
  "Czech Republic": ["Prague", "Brno", "Ostrava"],
};

interface Surgery {
  name: string;
  price: number;
  category: "plastic-surgery" | "dental" | "hair-transplant";
  group: string;
}

const allSurgeries: Surgery[] = [
  { name: "FUE Hair Transplant", price: 1800, category: "hair-transplant", group: "Hair" },
  { name: "DHI Hair Transplant", price: 2200, category: "hair-transplant", group: "Hair" },
  { name: "FUT Hair Transplant", price: 1500, category: "hair-transplant", group: "Hair" },
  { name: "Beard Transplant", price: 1200, category: "hair-transplant", group: "Hair" },
  { name: "Eyebrow Transplant", price: 1000, category: "hair-transplant", group: "Hair" },
  { name: "PRP Therapy", price: 400, category: "hair-transplant", group: "Hair" },
  { name: "Rhinoplasty", price: 2500, category: "plastic-surgery", group: "Face" },
  { name: "Facelift", price: 4500, category: "plastic-surgery", group: "Face" },
  { name: "Eyelid Surgery", price: 1800, category: "plastic-surgery", group: "Face" },
  { name: "Neck Lift", price: 2200, category: "plastic-surgery", group: "Face" },
  { name: "Dental Implants", price: 800, category: "dental", group: "Dental" },
  { name: "Veneers", price: 250, category: "dental", group: "Dental" },
  { name: "Teeth Whitening", price: 300, category: "dental", group: "Dental" },
  { name: "Dental Crowns", price: 200, category: "dental", group: "Dental" },
  { name: "Full Mouth Reconstruction", price: 4000, category: "dental", group: "Dental" },
  { name: "Dental Bridges", price: 600, category: "dental", group: "Dental" },
  { name: "Invisalign", price: 2500, category: "dental", group: "Dental" },
  { name: "Root Canal", price: 350, category: "dental", group: "Dental" },
  { name: "Breast Augmentation", price: 3200, category: "plastic-surgery", group: "Chest & Torso" },
  { name: "Breast Reduction", price: 2800, category: "plastic-surgery", group: "Chest & Torso" },
  { name: "Breast Lift", price: 2600, category: "plastic-surgery", group: "Chest & Torso" },
  { name: "Tummy Tuck", price: 3500, category: "plastic-surgery", group: "Chest & Torso" },
  { name: "Liposuction", price: 2800, category: "plastic-surgery", group: "Body" },
  { name: "BBL (Brazilian Butt Lift)", price: 3800, category: "plastic-surgery", group: "Body" },
  { name: "Mommy Makeover", price: 5500, category: "plastic-surgery", group: "Body" },
  { name: "Arm Lift", price: 2200, category: "plastic-surgery", group: "Body" },
  { name: "Thigh Lift", price: 2500, category: "plastic-surgery", group: "Body" },
];

const mockClinics = [
  { id: 1, name: "Istanbul Medical Center", city: "Istanbul", country: "Turkey", rating: 4.8, procedures: ["Rhinoplasty", "Hair Transplant", "Breast Augmentation", "Liposuction"], startingPrice: 2500 },
  { id: 2, name: "Bangkok Dental Excellence", city: "Bangkok", country: "Thailand", rating: 4.9, procedures: ["Dental Implants", "Veneers", "Teeth Whitening", "Full Mouth Reconstruction"], startingPrice: 1200 },
  { id: 3, name: "Cancun Cosmetic Surgery", city: "Cancun", country: "Mexico", rating: 4.7, procedures: ["BBL", "Tummy Tuck", "Facelift", "Breast Lift"], startingPrice: 3500 },
];

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getProcedureCategory(procedure: string) {
  const normalized = normalizeText(procedure);
  if (normalized.includes("dental") || normalized.includes("teeth") || normalized.includes("implant") || normalized.includes("veneer") || normalized.includes("crown") || normalized.includes("bridge") || normalized.includes("invisalign") || normalized.includes("canal")) {
    return "dental";
  }
  if (normalized.includes("hair") || normalized.includes("transplant")) {
    return "hair-transplant";
  }
  return "plastic-surgery";
}

function getBodyPartProcedures(part: string | null) {
  if (!part) return [];

  const map: Record<string, string[]> = {
    face: ["Rhinoplasty", "Facelift", "Eyelid Surgery", "Neck Lift"],
    nose: ["Rhinoplasty"],
    teeth: ["Dental Implants", "Veneers", "Teeth Whitening", "Dental Crowns", "Full Mouth Reconstruction", "Dental Bridges", "Invisalign", "Root Canal"],
    chest: ["Breast Augmentation", "Breast Reduction", "Breast Lift"],
    abdomen: ["Tummy Tuck", "Liposuction", "Mommy Makeover"],
    arms: ["Arm Lift"],
    legs: ["Thigh Lift"],
  };

  return map[part] ?? [];
}

// ── Date Range Picker ─────────────────────────────────────────────────────────

interface DateRange { from: string; to: string; }

function DateRangePicker({ value, onChange }: { value: DateRange; onChange: (r: DateRange) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, useCallback(() => setOpen(false), []));
  const today = new Date().toISOString().split("T")[0];
  const label = value.from && value.to ? `${value.from} → ${value.to}` : value.from ? `From ${value.from}` : "Select dates";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-full w-full min-w-[190px] px-3 py-3 bg-input-background rounded-lg border border-border flex items-center gap-2 text-sm hover:border-primary transition-colors"
      >
        <Calendar size={16} className="text-muted-foreground shrink-0" />
        <span className={value.from ? "" : "text-muted-foreground"}>{label}</span>
        <ChevronDown size={14} className="ml-auto text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-30 top-full mt-1 left-0 bg-card border border-border rounded-xl shadow-xl p-4 min-w-[280px]">
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Travel window</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">From</label>
              <input
                type="date"
                value={value.from}
                min={today}
                onChange={(e) => onChange({ from: e.target.value, to: value.to && e.target.value > value.to ? "" : value.to })}
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">To</label>
              <input
                type="date"
                value={value.to}
                min={value.from || today}
                onChange={(e) => { onChange({ ...value, to: e.target.value }); setOpen(false); }}
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          {(value.from || value.to) && (
            <button onClick={() => { onChange({ from: "", to: "" }); setOpen(false); }} className="mt-3 text-xs text-muted-foreground hover:text-destructive transition-colors">
              Clear dates
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Location Selector ─────────────────────────────────────────────────────────

function LocationSelector({ country, city, onCountryChange, onCityChange }: {
  country: string; city: string;
  onCountryChange: (c: string) => void;
  onCityChange: (c: string) => void;
}) {
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
          onClick={() => { setOpenCountry((o) => !o); setOpenCity(false); }}
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
            {Object.keys(countryCities).map((c) => (
              <button
                key={c}
                onClick={() => { onCountryChange(c); onCityChange(""); setOpenCountry(false); setOpenCity(true); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${country === c ? "bg-primary/10 text-primary font-medium" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {country && (
        <div className="relative" ref={cityRef}>
          <button
            type="button"
            onClick={() => { setOpenCity((o) => !o); setOpenCountry(false); }}
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
              {cities.map((c) => (
                <button
                  key={c}
                  onClick={() => { onCityChange(c); setOpenCity(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${city === c ? "bg-primary/10 text-primary font-medium" : ""}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Surgery Filter ─────────────────────────────────────────────────────────────

function SurgeryFilter({ selected, onChange, category }: { selected: string[]; onChange: (s: string[]) => void; category: string; }) {
  const filtered = category ? allSurgeries.filter((s) => s.category === category) : allSurgeries;
  const groups = [...new Set(filtered.map((s) => s.group))];
  const toggle = (name: string) => onChange(selected.includes(name) ? selected.filter((x) => x !== name) : [...selected, name]);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{group}</p>
          <div className="space-y-1">
            {filtered.filter((s) => s.group === group).map((surgery) => (
              <label key={surgery.name} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(surgery.name)}
                    onChange={() => toggle(surgery.name)}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">{surgery.name}</span>
                </div>
                <span className="text-xs text-primary font-medium shrink-0">from ${surgery.price.toLocaleString()}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Search Page ──────────────────────────────────────────────────────────

function SearchContent() {
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(true);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: "", to: "" });
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    rating: 0,
    category: searchParams.get("category") || "",
    surgeryTypes: [] as string[],
    sortBy: "popularity",
  });

  const removeSurgery = (s: string) =>
    setFilters((current) => ({
      ...current,
      surgeryTypes: current.surgeryTypes.filter((x) => x !== s),
    }));

  const selectedSurgeriesWithPrices = filters.surgeryTypes.map((name) => {
    const s = allSurgeries.find((x) => x.name === name);
    return { name, price: s?.price ?? 0 };
  });

  const activeBodyPartProcedures = useMemo(() => getBodyPartProcedures(selectedBodyPart), [selectedBodyPart]);

  const filteredClinics = useMemo(() => {
    const keywordText = keyword.trim().toLowerCase();
    let clinics = [...mockClinics];

    if (keywordText) {
      clinics = clinics.filter((clinic) => {
        const haystack = [clinic.name, ...clinic.procedures].join(" ").toLowerCase();
        return haystack.includes(keywordText);
      });
    }

    if (country) {
      clinics = clinics.filter((clinic) => clinic.country === country);
    }

    if (city) {
      clinics = clinics.filter((clinic) => clinic.city === city);
    }

    if (filters.category) {
      clinics = clinics.filter((clinic) =>
        clinic.procedures.some((procedure) => getProcedureCategory(procedure) === filters.category)
      );
    }

    if (filters.surgeryTypes.length) {
      clinics = clinics.filter((clinic) =>
        filters.surgeryTypes.some((selectedSurgery) =>
          clinic.procedures.some((procedure) =>
            normalizeText(procedure).includes(normalizeText(selectedSurgery)) ||
            normalizeText(selectedSurgery).includes(normalizeText(procedure))
          )
        )
      );
    }

    if (filters.priceRange[1] < 20000) {
      clinics = clinics.filter((clinic) => clinic.startingPrice <= filters.priceRange[1]);
    }

    if (filters.rating > 0) {
      clinics = clinics.filter((clinic) => clinic.rating >= filters.rating);
    }

    if (activeBodyPartProcedures.length) {
      clinics = clinics.filter((clinic) =>
        clinic.procedures.some((procedure) =>
          activeBodyPartProcedures.some((bodyPartProcedure) =>
            normalizeText(procedure).includes(normalizeText(bodyPartProcedure)) ||
            normalizeText(bodyPartProcedure).includes(normalizeText(procedure))
          )
        )
      );
    }

    const sortedClinics = [...clinics];
    switch (filters.sortBy) {
      case "price-low":
        sortedClinics.sort((a, b) => a.startingPrice - b.startingPrice);
        break;
      case "price-high":
        sortedClinics.sort((a, b) => b.startingPrice - a.startingPrice);
        break;
      case "rating":
        sortedClinics.sort((a, b) => b.rating - a.rating);
        break;
      default:
        sortedClinics.sort((a, b) => b.rating - a.rating);
    }

    return sortedClinics;
  }, [activeBodyPartProcedures, city, country, filters.category, filters.priceRange, filters.rating, filters.sortBy, filters.surgeryTypes, keyword]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Search Bar */}
      <div className="bg-card border-b border-border py-5 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4">Find Your Perfect Clinic</h1>
          <div className="flex gap-3 flex-wrap lg:flex-nowrap items-stretch">
            <LocationSelector country={country} city={city} onCountryChange={setCountry} onCityChange={setCity} />
            <div className="hidden lg:block w-px bg-border self-stretch" />
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <div className="hidden lg:block w-px bg-border self-stretch" />
            <div className="flex-1 min-w-[180px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Clinic name, procedure…"
                className="w-full h-full pl-9 pr-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap text-sm ${showFilters ? "bg-primary text-primary-foreground" : "bg-input-background border border-border hover:border-primary"}`}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>

          {(country || dateRange.from) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {country && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full flex items-center gap-1">
                  {city ? `${city}, ${country}` : country}
                  <button onClick={() => { setCountry(""); setCity(""); }} className="hover:text-destructive"><X size={10} /></button>
                </span>
              )}
              {dateRange.from && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full flex items-center gap-1">
                  {dateRange.from}{dateRange.to ? ` → ${dateRange.to}` : ""}
                  <button onClick={() => setDateRange({ from: "", to: "" })} className="hover:text-destructive"><X size={10} /></button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          {showFilters && (
            <aside className="w-80 flex-shrink-0">
              <div className="bg-card rounded-xl p-6 border border-border sticky top-[106px] max-h-[calc(100vh-130px)] overflow-y-auto">
                <h3 className="font-semibold mb-5">Filters</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-semibold">Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "", label: "All" },
                        { value: "plastic-surgery", label: "Plastic" },
                        { value: "dental", label: "Dental" },
                        { value: "hair-transplant", label: "Hair" },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setFilters((current) => ({ ...current, category: value, surgeryTypes: [] }))}
                          className={`py-2 px-3 rounded-lg border-2 text-sm transition-all ${filters.category === value ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:border-primary/40"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-3 text-sm font-semibold">Procedures</label>
                    <SurgeryFilter
                      selected={filters.surgeryTypes}
                      onChange={(s) => setFilters((current) => ({ ...current, surgeryTypes: s }))}
                      category={filters.category}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold">Max Price</label>
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>$0</span>
                      <span className="font-medium text-foreground">${filters.priceRange[1].toLocaleString()}</span>
                    </div>
                    <input
                      type="range" min="0" max="20000" step="500"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters((current) => ({ ...current, priceRange: [0, parseInt(e.target.value)] }))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold">Minimum Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setFilters((current) => ({ ...current, rating: star }))} className="p-0.5">
                          <Star size={20} className={star <= filters.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                        </button>
                      ))}
                      {filters.rating > 0 && (
                        <button onClick={() => setFilters((current) => ({ ...current, rating: 0 }))} className="text-xs text-muted-foreground ml-1 hover:text-destructive">clear</button>
                      )}
                    </div>
                  </div>
 
                  {/* <div>
                    <label className="block mb-3 text-sm font-semibold">Select Body Part</label>
                    <BodyPartSelector onSelectBodyPart={(part) => setSelectedBodyPart(part)} selectedPart={selectedBodyPart} />
                  </div> */}
                </div>
              </div>
            </aside>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            {selectedSurgeriesWithPrices.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4 mb-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">Selected procedures</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSurgeriesWithPrices.map(({ name, price }) => (
                    <span key={name} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {name}
                      <span className="text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">from ${price.toLocaleString()}</span>
                      <button onClick={() => removeSurgery(name)} className="hover:text-destructive transition-colors"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-5">
              <p className="text-muted-foreground text-sm">
                Showing <span className="font-semibold text-foreground">{filteredClinics.length}</span> clinics
              </p>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((current) => ({ ...current, sortBy: e.target.value }))}
                className="px-3 py-2 bg-card rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                <option value="popularity">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="grid gap-5">
              {filteredClinics.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-10 text-center text-muted-foreground">
                  No clinics match your selected filters. Try broadening your criteria.
                </div>
              ) : (
                filteredClinics.map((clinic) => (
                <Link
                  key={clinic.id}
                  href={`/clinic/${clinic.id}`}
                  className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-72 h-44 md:h-auto bg-gradient-to-br from-primary/20 to-primary/10 shrink-0" />
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold">{clinic.name}</h3>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg shrink-0">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-sm">{clinic.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-3 text-sm">
                        <MapPin size={14} />
                        <span>{clinic.city}, {clinic.country}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {clinic.procedures.slice(0, 3).map((proc, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">{proc}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <DollarSign size={14} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Starting from</span>
                          <span className="font-semibold">${clinic.startingPrice.toLocaleString()}</span>
                        </div>
                        <span className="text-primary font-medium text-sm">View Details →</span>
                      </div>
                    </div>
                  </div>
                </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <SearchContent />
    </Suspense>
  );
}
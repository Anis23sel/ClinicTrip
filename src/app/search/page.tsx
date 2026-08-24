"use client";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Star, X } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";
import SearchDateRangePicker from "../components/search/SearchDateRangePicker";
import SearchLocationSelector from "../components/search/SearchLocationSelector";
import SearchProcedureFilter from "../components/search/SearchProcedureFilter";
import ClinicResultCard from "../components/search/ClinicResultCard";
import { getBodyPartProcedures, getProcedureCategory, normalizeText, type ClinicResult, type DatabaseCategory, type DatabaseCity, type DatabaseClinic, type DatabaseClinicProcedure, type DatabaseDoctor, type DatabaseDoctorProcedure, type DatabaseDomain, type DatabaseProcedure, type DatabaseSpeciality, type DateRange, type DoctorResult, type Surgery } from "../components/search/searchTypes";

const supabase = createClient();

// ── Main Search Page ──────────────────────────────────────────────────────────

function SearchContent() {
  const searchParams = useSearchParams();
  const [clinics, setClinics] = useState<ClinicResult[]>([]);
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [countryCities, setCountryCities] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
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

  useEffect(() => {
    const loadSearchData = async () => {
      setLoading(true);
      setLoadError("");

      const [clinicsResult, citiesResult, proceduresResult, categoriesResult, domainsResult, clinicProceduresResult, doctorsResult, specialitiesResult, doctorProceduresResult] = await Promise.all([
        supabase.from("clinics").select("id, clinic_name, country, city_id"),
        supabase.from("cities").select("id, city"),
        supabase.from("medical_procedure").select("id, name, category_id"),
        supabase.from("medical_categories").select("id, name, domain_id"),
        supabase.from("medical_domains").select("id, name"),
        supabase.from("clinic_procedures").select("clinic_id, procedure_id, starting_price"),
        supabase.from("doctors").select("id, first_name, last_name, speciality_id, clinic_id"),
        supabase.from("specialities").select("id, name"),
        supabase.from("doctors_procedures").select("doctor_id, procedure_id"),
      ]);

      const queryError = [
        clinicsResult.error,
        citiesResult.error,
        proceduresResult.error,
        categoriesResult.error,
        domainsResult.error,
        clinicProceduresResult.error,
        doctorsResult.error,
        specialitiesResult.error,
        doctorProceduresResult.error,
      ].find(Boolean);

      if (queryError) {
        console.error("Failed to load clinic search data:", queryError);
        setLoadError("We could not load clinics right now. Please try again.");
        setLoading(false);
        return;
      }

      const clinicRows = (clinicsResult.data || []) as DatabaseClinic[];
      const cityRows = (citiesResult.data || []) as DatabaseCity[];
      const procedureRows = (proceduresResult.data || []) as DatabaseProcedure[];
      const categoryRows = (categoriesResult.data || []) as DatabaseCategory[];
      const domainRows = (domainsResult.data || []) as DatabaseDomain[];
      const clinicProcedureRows = (clinicProceduresResult.data || []) as DatabaseClinicProcedure[];
      const doctorRows = (doctorsResult.data || []) as DatabaseDoctor[];
      const specialityRows = (specialitiesResult.data || []) as DatabaseSpeciality[];
      const doctorProcedureRows = (doctorProceduresResult.data || []) as DatabaseDoctorProcedure[];
      const cityById = new Map(cityRows.map((row) => [String(row.id), row.city]));
      const procedureById = new Map(procedureRows.map((row) => [String(row.id), row]));
      const categoryById = new Map(categoryRows.map((row) => [String(row.id), row]));
      const domainById = new Map(domainRows.map((row) => [String(row.id), row]));
      const specialityById = new Map(specialityRows.map((row) => [String(row.id), row.name]));
      const doctorProceduresByDoctor = new Map<string, DatabaseDoctorProcedure[]>();
      const clinicProceduresByClinic = new Map<string, DatabaseClinicProcedure[]>();

      for (const doctorProcedure of doctorProcedureRows) {
        const doctorId = String(doctorProcedure.doctor_id);
        const procedures = doctorProceduresByDoctor.get(doctorId) || [];
        procedures.push(doctorProcedure);
        doctorProceduresByDoctor.set(doctorId, procedures);
      }

      for (const clinicProcedure of clinicProcedureRows) {
        const clinicId = String(clinicProcedure.clinic_id);
        const procedures = clinicProceduresByClinic.get(clinicId) || [];
        procedures.push(clinicProcedure);
        clinicProceduresByClinic.set(clinicId, procedures);
      }

      const doctorsByClinic = new Map<string, DoctorResult[]>();
      for (const doctor of doctorRows) {
        const doctorProcedures = doctorProceduresByDoctor.get(String(doctor.id)) || [];
        const doctorResult: DoctorResult = {
          id: doctor.id,
          name: [doctor.first_name, doctor.last_name].filter(Boolean).join(" ") || "Doctor",
          speciality: doctor.speciality_id === null ? "" : specialityById.get(String(doctor.speciality_id)) || "",
          procedures: [...new Set(doctorProcedures.flatMap((doctorProcedure) => {
            const procedure = procedureById.get(String(doctorProcedure.procedure_id));
            return procedure ? [procedure.name] : [];
          }))],
        };
        const clinicDoctors = doctorsByClinic.get(String(doctor.clinic_id)) || [];
        clinicDoctors.push(doctorResult);
        doctorsByClinic.set(String(doctor.clinic_id), clinicDoctors);
      }

      const clinicResultsData = clinicRows.map((clinic): ClinicResult => {
        const clinicProcedures = clinicProceduresByClinic.get(String(clinic.id)) || [];
        const procedureNames = clinicProcedures.flatMap((clinicProcedure) => {
          const procedure = procedureById.get(String(clinicProcedure.procedure_id));
          return procedure ? [procedure.name] : [];
        });
        const prices = clinicProcedures
          .map((clinicProcedure) => Number(clinicProcedure.starting_price))
          .filter((price) => Number.isFinite(price));

        return {
          id: clinic.id,
          name: clinic.clinic_name,
          city: cityById.get(String(clinic.city_id)) || "",
          country: clinic.country || "",
          rating: null,
          procedures: [...new Set(procedureNames)],
          doctors: doctorsByClinic.get(String(clinic.id)) || [],
          startingPrice: prices.length ? Math.min(...prices) : 0,
        };
      });

      const surgeryPrices = new Map<string, number[]>();
      for (const clinicProcedure of clinicProcedureRows) {
        const procedure = procedureById.get(String(clinicProcedure.procedure_id));
        if (!procedure) continue;
        const price = Number(clinicProcedure.starting_price);
        const prices = surgeryPrices.get(String(procedure.id)) || [];
        if (Number.isFinite(price)) prices.push(price);
        surgeryPrices.set(String(procedure.id), prices);
      }

      const surgeryData = procedureRows
        .filter((procedure) => surgeryPrices.has(String(procedure.id)))
        .map((procedure) => {
          const category = procedure.category_id === null ? undefined : categoryById.get(String(procedure.category_id));
          const domain = category?.domain_id === null || category?.domain_id === undefined ? undefined : domainById.get(String(category.domain_id));
          const prices = surgeryPrices.get(String(procedure.id)) || [];
          return {
            name: procedure.name,
            price: prices.length ? Math.min(...prices) : 0,
            category: getProcedureCategory(`${domain?.name || ""} ${category?.name || ""} ${procedure.name}`),
            group: domain?.name || category?.name || "Other",
          };
        });

      const citiesByCountry: Record<string, string[]> = {};
      for (const clinic of clinicResultsData) {
        if (!clinic.country || !clinic.city) continue;
        citiesByCountry[clinic.country] = [...new Set([...(citiesByCountry[clinic.country] || []), clinic.city])];
      }

      setClinics(clinicResultsData);
      setSurgeries(surgeryData);
      setCountryCities(citiesByCountry);
      setLoading(false);
    };

    loadSearchData();
  }, []);

  const removeSurgery = (s: string) =>
    setFilters((current) => ({
      ...current,
      surgeryTypes: current.surgeryTypes.filter((x) => x !== s),
    }));

  const selectedSurgeriesWithPrices = filters.surgeryTypes.map((name) => {
    const s = surgeries.find((x) => x.name === name);
    return { name, price: s?.price ?? 0 };
  });

  const activeBodyPartProcedures = useMemo(() => getBodyPartProcedures(selectedBodyPart), [selectedBodyPart]);

  const filteredClinics = useMemo(() => {
    const keywordText = keyword.trim().toLowerCase();
    let filtered = [...clinics];

    if (keywordText) {
      filtered = filtered.filter((clinic) => {
        const haystack = [clinic.name, ...clinic.procedures].join(" ").toLowerCase();
        return haystack.includes(keywordText);
      });
    }

    if (country) {
      filtered = filtered.filter((clinic) => clinic.country === country);
    }

    if (city) {
      filtered = filtered.filter((clinic) => clinic.city === city);
    }

    if (filters.category) {
      filtered = filtered.filter((clinic) =>
        clinic.procedures.some((procedure) => getProcedureCategory(procedure) === filters.category)
      );
    }

    if (filters.surgeryTypes.length) {
      filtered = filtered.filter((clinic) =>
        filters.surgeryTypes.some((selectedSurgery) =>
          clinic.procedures.some((procedure) =>
            normalizeText(procedure).includes(normalizeText(selectedSurgery)) ||
            normalizeText(selectedSurgery).includes(normalizeText(procedure))
          )
        )
      );
    }

    if (filters.priceRange[1] < 20000) {
      filtered = filtered.filter((clinic) => clinic.startingPrice <= filters.priceRange[1]);
    }

    if (filters.rating > 0) {
      filtered = filtered.filter((clinic) => clinic.rating !== null && clinic.rating >= filters.rating);
    }

    if (activeBodyPartProcedures.length) {
      filtered = filtered.filter((clinic) =>
        clinic.procedures.some((procedure) =>
          activeBodyPartProcedures.some((bodyPartProcedure) =>
            normalizeText(procedure).includes(normalizeText(bodyPartProcedure)) ||
            normalizeText(bodyPartProcedure).includes(normalizeText(procedure))
          )
        )
      );
    }

    const sortedClinics = [...filtered];
    switch (filters.sortBy) {
      case "price-low":
        sortedClinics.sort((a, b) => a.startingPrice - b.startingPrice);
        break;
      case "price-high":
        sortedClinics.sort((a, b) => b.startingPrice - a.startingPrice);
        break;
      case "rating":
        sortedClinics.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
        break;
      default:
        sortedClinics.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    }

    return sortedClinics;
  }, [activeBodyPartProcedures, city, clinics, country, filters.category, filters.priceRange, filters.rating, filters.sortBy, filters.surgeryTypes, keyword]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Search Bar */}
      <div className="bg-card border-b border-border py-5 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4">Find Your Perfect Clinic</h1>
          <div className="flex gap-3 flex-wrap lg:flex-nowrap items-stretch">
            <SearchLocationSelector country={country} city={city} onCountryChange={setCountry} onCityChange={setCity} countryCities={countryCities} />
            <div className="hidden lg:block w-px bg-border self-stretch" />
            <SearchDateRangePicker value={dateRange} onChange={setDateRange} />
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
                    <SearchProcedureFilter
                      selected={filters.surgeryTypes}
                      onChange={(s) => setFilters((current) => ({ ...current, surgeryTypes: s }))}
                      category={filters.category}
                      surgeries={surgeries}
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
              {loading ? (
                <div className="bg-card rounded-xl border border-border p-10 text-center text-muted-foreground">
                  Loading clinics...
                </div>
              ) : loadError ? (
                <div role="alert" className="bg-card rounded-xl border border-border p-10 text-center text-destructive">
                  {loadError}
                </div>
              ) : filteredClinics.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-10 text-center text-muted-foreground">
                  No clinics match your selected filters. Try broadening your criteria.
                </div>
              ) : (
                filteredClinics.map((clinic) => {
                  const selectedProcedure = filters.surgeryTypes.find((selectedSurgery) =>
                    clinic.procedures.some((procedure) =>
                      normalizeText(procedure).includes(normalizeText(selectedSurgery)) ||
                      normalizeText(selectedSurgery).includes(normalizeText(procedure))
                    )
                  );

                  return (
                    <ClinicResultCard
                      key={clinic.id}
                      clinic={clinic}
                      selectedProcedure={selectedProcedure}
                    />
                  );
                }))}
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
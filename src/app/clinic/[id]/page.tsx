"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { MapPin, Plane, Car } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/app/utils/supabase/client";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { format } from "date-fns";

type BookingTab = "clinic" | "accommodation" | "transfer";

type ClinicProcedure = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number | null;
  starting_price: number | null;
};

type ClinicDoctor = {
  id: string;
  name: string;
  speciality: string | null;
  procedures: string[];
};

type ClinicData = {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string | null;
  procedures: ClinicProcedure[];
  doctors: ClinicDoctor[];
};

export default function ClinicPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Keep Supabase client stable
  const [supabase] = useState(() => createClient());

  /*
   * ============================================================
   * SEARCH FILTERS
   * ============================================================
   */

  const proceduresParam = searchParams.get("procedures");

  const selectedProcedures = proceduresParam
    ? proceduresParam
        .split(",")
        .map((procedure) => decodeURIComponent(procedure).trim())
        .filter(Boolean)
    : [];

  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<BookingTab>("clinic");

  /*
   * ============================================================
   * BOOKING INFORMATION
   * ============================================================
   */

  const [booking, setBooking] = useState({
    doctorId: "",
    startDate: "",
    endDate: "",

    // Accommodation
    accommodationId: "",
    roomType: "",
    nights: 1,
    includeBreakfast: false,
    includeDinner: false,

    // Transfer
    transferPackage: false,
  });

  /*
   * ============================================================
   * STATIC ACCOMMODATIONS
   * ============================================================
   */

  const accommodations = [
    {
      id: "hotel-1",
      name: "Partner Hotel Premium",
      distance: "5 min walk from clinic",
      roomTypes: [
        { type: "Single Room", price: 60 },
        { type: "Double Bed Room", price: 80 },
        { type: "Suite", price: 120 },
      ],
    },
    {
      id: "hotel-2",
      name: "Partner Hotel Standard",
      distance: "10 min walk from clinic",
      roomTypes: [
        { type: "Single Room", price: 40 },
        { type: "Double Bed Room", price: 55 },
      ],
    },
  ];

  /*
   * ============================================================
   * DATE PICKER
   * ============================================================
   */

  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  /*
   * ============================================================
   * PROCEDURES SELECTED BY PATIENT
   * ============================================================
   */

  const [selectedProcedureIds, setSelectedProcedureIds] =
    useState<string[]>([]);

  /*
   * ============================================================
   * LOAD CLINIC
   * ============================================================
   */

  useEffect(() => {
    const loadClinic = async () => {
      setLoading(true);
      setError("");

      /*
       * 1. Load clinic
       */

      const { data: clinicRow, error: clinicError } =
        await supabase
          .from("clinics")
          .select("id, clinic_name, country, city_id")
          .eq("id", id)
          .single();

      if (clinicError || !clinicRow) {
        throw clinicError || new Error("Clinic not found.");
      }

      /*
       * 2. Load city
       */

      const { data: cityRow, error: cityError } = await supabase
        .from("cities")
        .select("city")
        .eq("id", clinicRow.city_id)
        .single();

      if (cityError) {
        throw cityError;
      }

      /*
       * 3. Load ALL procedures offered by this clinic
       */

      const { data: clinicProcedureRows, error: procedureError } =
        await supabase
          .from("clinic_procedures")
          .select(`
            id,
            starting_price,
            procedure_id,
            medical_procedure (
              id,
              name,
              description,
              duration_minutes
            )
          `)
          .eq("clinic_id", id);

      if (procedureError) {
        throw procedureError;
      }

      /*
       * Build ALL clinic procedures.
       */

      const procedures: ClinicProcedure[] = (clinicProcedureRows || [])
        .map((row) => {
          const procedure = Array.isArray(row.medical_procedure)
            ? row.medical_procedure[0]
            : row.medical_procedure;

          if (!procedure) return null;

          return {
            id: String(row.id),
            name: procedure.name,
            description: procedure.description,
            duration_minutes: procedure.duration_minutes,
            starting_price:
              row.starting_price !== null
                ? Number(row.starting_price)
                : null,
          };
        })
        .filter(
          (procedure): procedure is ClinicProcedure =>
            procedure !== null
        );

      /*
       * ========================================================
       * INITIAL PROCEDURE SELECTION
       * ========================================================
       */

      const initiallySelectedProcedureIds =
        selectedProcedures.length > 0
          ? procedures
              .filter((procedure) =>
                selectedProcedures.some(
                  (selected) =>
                    selected.toLowerCase() ===
                    procedure.name.toLowerCase()
                )
              )
              .map((procedure) => procedure.id)
          : [];

      setSelectedProcedureIds(initiallySelectedProcedureIds);

      /*
       * 4. Load doctors + speciality + procedures
       */

      const { data: doctorRows, error: doctorError } = await supabase
        .from("doctors")
        .select(`
          id,
          first_name,
          last_name,
          speciality_id,
          specialities (
            id,
            name
          ),
          doctors_procedures (
            procedure_id,
            medical_procedure (
              name
            )
          )
        `)
        .eq("clinic_id", id);

      if (doctorError) {
        throw doctorError;
      }

      const doctors: ClinicDoctor[] = (doctorRows || []).map((doctor) => {
        const speciality = Array.isArray(doctor.specialities)
          ? doctor.specialities[0]
          : doctor.specialities;

        const doctorProcedures = (doctor.doctors_procedures || [])
          .map((dp) => {
            const procedure = Array.isArray(dp.medical_procedure)
              ? dp.medical_procedure[0]
              : dp.medical_procedure;

            return procedure?.name || null;
          })
          .filter((name): name is string => Boolean(name));

        return {
          id: String(doctor.id),
          name: `${doctor.first_name} ${doctor.last_name}`,
          speciality: speciality?.name || null,
          procedures: doctorProcedures,
        };
      });

      /*
       * 5. Save complete clinic
       */

      setClinic({
        id: String(clinicRow.id),
        name: clinicRow.clinic_name,
        city: cityRow?.city || "",
        country: clinicRow.country || "",
        description: null,
        procedures,
        doctors,
      });
    };

    loadClinic()
      .catch((loadError) => {
        console.error("Failed to load clinic:", loadError);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "We could not load this clinic."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, supabase, selectedProcedures.join(",")]);

  /*
   * ============================================================
   * CONTACT CLINIC
   * ============================================================
   */

  const handleContactClinic = async () => {
    if (!clinic) return;

    /*
     * Patient must select at least one procedure.
     */

    if (selectedProcedureIds.length === 0) {
      alert("Please select at least one procedure.");
      return;
    }

    /*
     * Check authentication.
     */

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    /*
     * Convert selected procedure IDs into names.
     */

    const selectedProcedureNames = clinic.procedures
      .filter((procedure) =>
        selectedProcedureIds.includes(procedure.id)
      )
      .map((procedure) => procedure.name);

    /*
     * Create patient request.
     */

    const response = await fetch("/api/patient-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clinicId: clinic.id,
        procedures: selectedProcedureNames,
        doctorId: booking.doctorId || null,
        startDate: booking.startDate || null,
        endDate: booking.endDate || null,
      }),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => null);

      console.error("Failed to create patient request:", result);

      alert(
        result?.error ||
          "Something went wrong while contacting the clinic."
      );

      return;
    }

    router.push("/dashboard/patient");
  };

  /*
   * ============================================================
   * DATE RANGE CHANGE
   * ============================================================
   */

  const handleDateRangeChange = (
    range: DateRange | undefined
  ) => {
    setDateRange(range);

    setBooking((prev) => ({
      ...prev,
      startDate: range?.from
        ? format(range.from, "yyyy-MM-dd")
        : "",
      endDate: range?.to
        ? format(range.to, "yyyy-MM-dd")
        : "",
    }));
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="p-8">
        Loading clinic...
      </div>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error || !clinic) {
    return (
      <div className="p-8">
        {error || "Clinic not found."}
      </div>
    );
  }

  /*
   * ============================================================
   * DISPLAYED PROCEDURES
   * ============================================================
   */

  const displayedProcedures =
    selectedProcedures.length === 0
      ? clinic.procedures
      : clinic.procedures.filter((procedure) =>
          selectedProcedures.some(
            (selected) =>
              selected.toLowerCase() ===
              procedure.name.toLowerCase()
          )
        );

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-background">

      {/* ========================================================
          HERO
      ======================================================== */}

      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12 px-4">
        <div className="max-w-7xl mx-auto">

          <h1 className="text-4xl font-bold mb-2">
            {clinic.name}
          </h1>

          <div className="flex items-center gap-2 text-primary-foreground/90">
            <MapPin size={16} />

            <span>
              {clinic.city}, {clinic.country}
            </span>
          </div>

        </div>
      </div>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ====================================================
              LEFT
          ==================================================== */}

          <div className="lg:col-span-2">

            <div className="bg-card rounded-xl border border-border">

              {/* Tabs */}

              <div className="border-b border-border flex">

                {(
                  [
                    "clinic",
                    "accommodation",
                    "transfer",
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-6 border-b-2 transition-colors capitalize font-semibold text-sm ${
                      activeTab === tab
                        ? "border-primary text-primary bg-primary/5"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}

              </div>

              {/* ==================================================
                  TAB CONTENT
              ================================================== */}

              <div className="p-6">

                {/* ==================================================
                    CLINIC TAB
                ================================================== */}

                {activeTab === "clinic" && (
                  <div className="space-y-6">

                    {/* ABOUT */}

                    <div>

                      <h3 className="text-xl font-semibold mb-3">
                        About the Clinic
                      </h3>

                      <p className="text-muted-foreground leading-relaxed">
                        {clinic.description ||
                          "Learn more about this clinic and the procedures and specialists available."}
                      </p>

                    </div>

                    {/* PROCEDURES */}

                    <div>

                      <h3 className="text-xl font-semibold mb-3">
                        Procedure Details
                      </h3>

                      <p className="text-sm text-muted-foreground mb-4">
                        {selectedProcedures.length === 0
                          ? "Select one or more procedures you are interested in."
                          : "The procedures matching your search are selected. You can change your selection below."}
                      </p>

                      <div className="space-y-3">

                        {displayedProcedures.length === 0 ? (
                          <div className="border border-border rounded-xl p-4 text-sm text-muted-foreground">
                            No matching procedures were found at this
                            clinic.
                          </div>
                        ) : (
                          displayedProcedures.map((procedure) => {

                            const isSelected =
                              selectedProcedureIds.includes(
                                procedure.id
                              );

                            return (
                              <button
                                key={procedure.id}
                                type="button"
                                onClick={() => {
                                  setSelectedProcedureIds((prev) =>
                                    prev.includes(procedure.id)
                                      ? prev.filter(
                                          (procedureId) =>
                                            procedureId !==
                                            procedure.id
                                        )
                                      : [
                                          ...prev,
                                          procedure.id,
                                        ]
                                  );
                                }}
                                className={`w-full text-left border-2 rounded-xl p-4 transition-all ${
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >

                                <div className="flex items-start justify-between gap-4">

                                  <div>

                                    <h4 className="font-semibold mb-1">
                                      {procedure.name}
                                    </h4>

                                    {procedure.description && (
                                      <p className="text-muted-foreground text-sm mb-3">
                                        {procedure.description}
                                      </p>
                                    )}

                                    {procedure.duration_minutes !==
                                      null && (
                                      <div className="mb-3">

                                        <p className="text-xs text-muted-foreground">
                                          Duration
                                        </p>

                                        <p className="font-medium text-sm">
                                          {procedure.duration_minutes}{" "}
                                          minutes
                                        </p>

                                      </div>
                                    )}

                                    {procedure.starting_price !==
                                      null && (
                                      <>
                                        <div className="text-2xl font-bold text-primary">
                                          $
                                          {procedure.starting_price.toLocaleString()}
                                        </div>

                                        <div className="text-sm text-muted-foreground">
                                          Starting price · Payment at
                                          the clinic
                                        </div>
                                      </>
                                    )}

                                  </div>

                                  {/* Selection indicator */}

                                  <div
                                    className={`w-5 h-5 rounded-full border-2 shrink-0 mt-1 ${
                                      isSelected
                                        ? "border-primary bg-primary"
                                        : "border-muted-foreground"
                                    }`}
                                  />

                                </div>

                              </button>
                            );
                          })
                        )}

                      </div>

                    </div>

                    {/* DOCTORS */}

                    <div>

                      <h3 className="text-xl font-semibold mb-3">
                        Select Doctor
                      </h3>

                      <p className="text-sm text-muted-foreground mb-4">
                        You can choose your doctor now or choose one
                        later.
                      </p>

                      <div className="space-y-3">

                        {/* Choose later */}

                        <label
                          className={`flex gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                            booking.doctorId === ""
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >

                          <input
                            type="radio"
                            name="doctor"
                            value=""
                            checked={booking.doctorId === ""}
                            onChange={() =>
                              setBooking((prev) => ({
                                ...prev,
                                doctorId: "",
                              }))
                            }
                            className="mt-1 accent-primary"
                          />

                          <div>

                            <h4 className="font-semibold">
                              Choose the doctor later
                            </h4>

                            <p className="text-muted-foreground text-sm">
                              We’ll help you select the right
                              specialist after your inquiry.
                            </p>

                          </div>

                        </label>

                        {/* Doctors */}

                        {clinic.doctors.map((doctor) => (

                          <label
                            key={doctor.id}
                            className={`flex gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                              booking.doctorId === doctor.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >

                            <input
                              type="radio"
                              name="doctor"
                              value={doctor.id}
                              checked={
                                booking.doctorId === doctor.id
                              }
                              onChange={(e) =>
                                setBooking((prev) => ({
                                  ...prev,
                                  doctorId: e.target.value,
                                }))
                              }
                              className="mt-1 accent-primary"
                            />

                            <div>

                              <h4 className="font-semibold">
                                {doctor.name}
                              </h4>

                              {doctor.speciality && (
                                <p className="text-primary text-sm">
                                  {doctor.speciality}
                                </p>
                              )}

                              {doctor.procedures.length > 0 && (
                                <p className="text-muted-foreground text-sm">
                                  Procedures:{" "}
                                  {doctor.procedures
                                    .slice(0, 3)
                                    .join(", ")}
                                </p>
                              )}

                            </div>

                          </label>

                        ))}

                      </div>

                    </div>

                    {/* DATES */}

                    <div className="space-y-4">

                      <label className="block text-sm font-medium">
                        Dates
                      </label>

                      <div className="rounded-lg border border-border bg-input-background p-3 sm:p-4">

                        <div className="overflow-x-auto">

                          <DayPicker
                            mode="range"
                            selected={dateRange}
                            onSelect={handleDateRangeChange}
                            disabled={{ before: new Date() }}
                            numberOfMonths={2}
                            pagedNavigation
                            captionLayout="dropdown"
                            className="clinic-calendar mx-auto"
                            style={
                              {
                                "--rdp-accent-color":
                                  "#391419",
                                "--rdp-accent-background-color":
                                  "rgba(57, 20, 25, 0.12)",
                                "--rdp-range_start-color":
                                  "#ffffff",
                                "--rdp-range_end-color":
                                  "#ffffff",
                                "--rdp-range_middle-color":
                                  "#391419",
                                "--rdp-range_middle-background-color":
                                  "rgba(57, 20, 25, 0.12)",
                                "--rdp-selected-border":
                                  "1px solid #391419",
                              } as CSSProperties
                            }
                            styles={{
                              months: {
                                display: "flex",
                                flexDirection: "row",
                                gap: "1.5rem",
                                justifyContent: "center",
                                alignItems: "flex-start",
                              },

                              month: {
                                margin: 0,
                              },
                            }}
                            modifiersStyles={{
                              range_start: {
                                backgroundColor: "#391419",
                                color: "#ffffff",
                                borderRadius: "9999px",
                              },

                              range_end: {
                                backgroundColor: "#391419",
                                color: "#ffffff",
                                borderRadius: "9999px",
                              },

                              range_middle: {
                                backgroundColor:
                                  "rgba(57, 20, 25, 0.12)",
                                color: "#391419",
                                borderRadius: 0,
                              },

                              selected: {
                                backgroundColor: "#391419",
                                color: "#ffffff",
                                borderRadius: "9999px",
                              },
                            }}
                          />

                        </div>

                      </div>

                    </div>

                  </div>
                )}

                {/* ==================================================
                    ACCOMMODATION TAB
                ================================================== */}

                {activeTab === "accommodation" && (
                  <div className="space-y-5">

                    <div>

                      <h3 className="text-xl font-semibold">
                        Select Accommodation
                      </h3>

                      <p className="text-sm text-muted-foreground mt-1">
                        Choose a partner hotel and room for your stay.
                      </p>

                    </div>

                    {accommodations.map((accommodation) => (

                      <div
                        key={accommodation.id}
                        className="border-2 border-border rounded-xl p-5"
                      >

                        <div className="mb-4">

                          <h4 className="font-semibold text-lg">
                            {accommodation.name}
                          </h4>

                          <p className="text-sm text-muted-foreground">
                            {accommodation.distance}
                          </p>

                        </div>

                        <div className="space-y-4 border-t border-border pt-4">

                          <div>

                            <p className="text-sm font-medium mb-2">
                              Room Type
                            </p>

                            <div className="grid sm:grid-cols-2 gap-2">

                              {accommodation.roomTypes.map((room) => (

                                <div
                                  key={room.type}
                                  className="p-3 rounded-lg border-2 border-border"
                                >

                                  <div className="font-medium text-sm">
                                    {room.type}
                                  </div>

                                  <div className="text-primary font-semibold text-sm">
                                    ${room.price}/night
                                  </div>

                                </div>

                              ))}

                            </div>

                          </div>

                          <div>

                            <p className="text-sm font-medium mb-2">
                              Meals
                            </p>

                            <div className="space-y-2">

                              <div className="flex items-center justify-between">
                                <span className="text-sm">
                                  Breakfast
                                </span>

                                <span className="text-primary text-sm font-semibold">
                                  +$15/night
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm">
                                  Dinner
                                </span>

                                <span className="text-primary text-sm font-semibold">
                                  +$25/night
                                </span>
                              </div>

                            </div>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>
                )}

                {/* ==================================================
                    TRANSFER TAB
                ================================================== */}

                {activeTab === "transfer" && (
                  <div className="space-y-5">

                    <div>

                      <h3 className="text-xl font-semibold">
                        Transfer Services
                      </h3>

                      <p className="text-sm text-muted-foreground mt-1">
                        Make your transportation between the airport,
                        hotel, and clinic easier.
                      </p>

                    </div>

                    <div className="border-2 border-border rounded-xl p-5">

                      <div className="mb-4">

                        <h4 className="font-semibold text-lg mb-1">
                          Complete Transfer Package
                        </h4>

                        <p className="text-sm text-muted-foreground mb-3">
                          Airport pick-up and drop-off plus daily
                          hotel ↔ clinic transfers.
                        </p>

                        <div className="text-primary font-bold text-xl">
                          $80{" "}
                          <span className="text-sm font-normal text-muted-foreground">
                            total
                          </span>
                        </div>

                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 border-t border-border pt-4">

                        {/* Airport Transfer */}

                        <div className="flex items-center gap-3 bg-background rounded-lg p-3">

                          <Plane
                            size={18}
                            className="text-primary shrink-0"
                          />

                          <div>

                            <p className="text-sm font-medium">
                              Airport Transfer
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Round-trip to hotel
                            </p>

                            <p className="text-xs text-primary font-semibold">
                              $50
                            </p>

                          </div>

                        </div>

                        {/* Clinic Transfers */}

                        <div className="flex items-center gap-3 bg-background rounded-lg p-3">

                          <Car
                            size={18}
                            className="text-primary shrink-0"
                          />

                          <div>

                            <p className="text-sm font-medium">
                              Clinic Transfers
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Daily hotel ↔ clinic
                            </p>

                            <p className="text-xs text-primary font-semibold">
                              $30
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                    <p className="text-sm text-muted-foreground bg-accent/30 rounded-xl p-4">
                      All transfers include professional drivers and
                      comfortable vehicles. Transfer times are coordinated
                      with your appointment schedule.
                    </p>

                  </div>
                )}

              </div>

            </div>

          </div>

          {/* ========================================================
              RIGHT SIDEBAR
          ======================================================== */}

          <div className="space-y-5">

            {/* Your Request */}

            <div className="bg-primary/10 rounded-xl border-2 border-primary p-6">

              <h3 className="font-semibold text-lg mb-2">
                Your Request
              </h3>

              <p className="text-sm text-muted-foreground">
                Select at least one procedure before contacting the
                clinic.
              </p>

              <button
                type="button"
                onClick={handleContactClinic}
                disabled={selectedProcedureIds.length === 0}
                className={`w-full mt-5 px-6 py-3 rounded-lg transition-opacity text-center font-semibold ${
                  selectedProcedureIds.length === 0
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                Contact the clinic and start now
              </button>

            </div>

            {/* Route Map */}

            <div className="bg-card rounded-xl border border-border p-5">

              <h3 className="font-semibold mb-3">
                Route Map
              </h3>

              <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">

                <div className="text-center text-muted-foreground">

                  <MapPin
                    size={44}
                    className="mx-auto mb-2 text-primary/50"
                  />

                  <p className="text-sm font-medium">
                    Hotel ↔ Clinic
                  </p>

                  <p className="text-xs opacity-70 mt-1">
                    {clinic.city}, {clinic.country}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
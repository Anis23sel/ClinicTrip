"use client";

import { useEffect, useState } from "react";
import { BedDouble, CalendarDays, Car, Check, Clock3, MapPin, Plane, Stethoscope } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";

type RequestDetails = {
  id: string;
  clinicId: string;
  clinicName: string;
  address: string;
  country: string;
  procedure: string;
  doctor: string;
  startDate: string | null;
  endDate: string | null;
  finalStartDate: string | null;
  finalEndDate: string | null;
  price: number | null;
  clinicApproved: boolean;
};

const accommodationOptions = [
  { id: "premium", name: "Partner Hotel Premium", detail: "5 min from clinic · per night", price: 60 },
  { id: "standard", name: "Partner Hotel Standard", detail: "10 min from clinic · per night", price: 40 },
];

function formatDate(value: string | null) {
  if (!value) return "Not specified";
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

export default function PatientRequestDetails({ requestId }: { requestId: string | null }) {
  const [supabase] = useState(() => createClient());
  const [details, setDetails] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accommodationId, setAccommodationId] = useState("");
  const [nights, setNights] = useState(1);
  const [transferSelected, setTransferSelected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadDetails = async () => {
      if (!requestId) {
        setError("No consultation was specified.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error("Please sign in to view this consultation.");

        const { data: profile, error: profileError } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
        if (profileError || !profile) throw new Error("We could not find your patient profile.");
        const { data: patient, error: patientError } = await supabase.from("patients").select("id").eq("profile_id", profile.id).maybeSingle();
        if (patientError || !patient) throw new Error("No patient record is linked to your account.");

        const { data: request, error: requestError } = await supabase
          .from("Patient_request")
          .select("id, id_clinic, id_patient, procedure, start_date, end_date, final_start_date, final_end_date, doctor_id, price, clinic_decision")
          .eq("id", requestId)
          .eq("id_patient", patient.id)
          .maybeSingle();
        if (requestError || !request) throw new Error("This consultation could not be found.");

        const [{ data: clinic, error: clinicError }, doctorResult] = await Promise.all([
          supabase.from("clinics").select("id, clinic_name, address, country").eq("id", request.id_clinic).maybeSingle(),
          request.doctor_id
            ? supabase.from("doctors").select("first_name, last_name").eq("id", request.doctor_id).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);
        if (clinicError) throw clinicError;
        if (doctorResult.error) throw doctorResult.error;
        if (!clinic) throw new Error("The clinic linked to this consultation could not be found.");

        if (!cancelled) setDetails({
          id: String(request.id),
          clinicId: String(request.id_clinic),
          clinicName: clinic.clinic_name || "Clinic",
          address: clinic.address || "",
          country: clinic.country || "",
          procedure: request.procedure || "Consultation",
          doctor: doctorResult.data ? `${doctorResult.data.first_name || ""} ${doctorResult.data.last_name || ""}`.trim() : "Not assigned",
          startDate: request.start_date,
          endDate: request.end_date,
          finalStartDate: request.final_start_date,
          finalEndDate: request.final_end_date,
          price: request.price === null ? null : Number(request.price),
          clinicApproved: request.clinic_decision ?? false,
        });
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "We could not load this consultation.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadDetails();
    return () => { cancelled = true; };
  }, [requestId, supabase]);

  if (loading) return <p className="py-12 text-center text-muted-foreground">Loading consultation details...</p>;
  if (error || !details) return <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">{error || "Consultation not found."}</p>;

  const accommodation = accommodationOptions.find((option) => option.id === accommodationId);
  const accommodationTotal = accommodation ? accommodation.price * Math.max(1, nights) : 0;
  const clinicTripFee = 100;
  const total = (details.price || 0) + accommodationTotal + (transferSelected ? 80 : 0) + clinicTripFee;
  const money = (value: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  const optionalLocked = !details.clinicApproved;

  return (
    <section aria-labelledby="request-details-heading" className="space-y-6">
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <header>
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Consultation</p>
            <h2 id="request-details-heading" className="mt-1 text-2xl font-bold">Request details</h2>
            <p className="mt-2 text-muted-foreground">Your clinic has to approve the consultation before you can add accommodation or transfers.</p>
          </header>

      <div className="flex flex-col gap-5">
        <article className="rounded-xl border-2 border-primary bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-lg bg-primary/10 p-2 text-primary"><Stethoscope size={20} /></span>
            <div><h3 className="text-lg font-semibold">Clinic</h3><p className="text-sm text-muted-foreground">Your selected consultation</p></div>
          </div>
          <div className="space-y-4">
            <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Clinic</p><p className="mt-1 font-semibold">{details.clinicName}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Procedure</p><p className="mt-1 font-medium">{details.procedure}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Doctor</p><p className="mt-1 font-medium">{details.doctor}</p></div>
            <div className="flex gap-2 text-sm text-muted-foreground"><MapPin size={16} className="mt-0.5 shrink-0 text-primary" />{[details.address, details.country].filter(Boolean).join(", ") || "Location not specified"}</div>
            <div className="flex gap-2 text-sm text-muted-foreground"><CalendarDays size={16} className="mt-0.5 shrink-0 text-primary" /><span>Requested: {formatDate(details.startDate)}{details.endDate && details.endDate !== details.startDate ? ` – ${formatDate(details.endDate)}` : ""}</span></div>
            {(details.finalStartDate || details.finalEndDate) && <div className="flex gap-2 text-sm text-muted-foreground"><CalendarDays size={16} className="mt-0.5 shrink-0 text-primary" /><span>Clinic dates: {formatDate(details.finalStartDate)}{details.finalEndDate && details.finalEndDate !== details.finalStartDate ? ` – ${formatDate(details.finalEndDate)}` : ""}</span></div>}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Consultation price</span><span className="font-bold text-primary">{details.price === null ? "Pending" : money(details.price)}</span>
          </div>
          <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${details.clinicApproved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
            {details.clinicApproved ? <Check size={15} /> : <Clock3 size={15} />}{details.clinicApproved ? "Approved by clinic" : "Awaiting clinic approval"}
          </div>
        </article>

        <article className={`relative rounded-xl border border-border bg-card p-5 transition-opacity ${optionalLocked ? "pointer-events-none select-none opacity-45 grayscale" : ""}`}>
          <div className="mb-5 flex items-center gap-3"><span className="rounded-lg bg-primary/10 p-2 text-primary"><BedDouble size={20} /></span><div><h3 className="text-lg font-semibold">Accommodation</h3><p className="text-sm text-muted-foreground">Choose a partner hotel</p></div></div>
          <div className="space-y-3">
            {accommodationOptions.map((option) => <button type="button" key={option.id} aria-pressed={accommodationId === option.id} onClick={() => setAccommodationId(accommodationId === option.id ? "" : option.id)} className={`w-full rounded-lg border p-4 text-left transition-colors ${accommodationId === option.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}><span className="flex items-center justify-between gap-3 font-medium">{option.name}{accommodationId === option.id && <Check size={17} className="text-primary" />}</span><span className="mt-1 block text-xs text-muted-foreground">{option.detail}</span><span className="mt-3 block font-semibold text-primary">{money(option.price)} / night</span></button>)}
          </div>
          {accommodation && <label className="mt-4 block text-sm">Number of nights<input type="number" min={1} max={30} value={nights} onChange={(event) => setNights(Math.min(30, Math.max(1, Number(event.target.value) || 1)))} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" /></label>}
          {optionalLocked && <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/20 p-5 text-center"><p className="rounded-lg bg-card/95 px-4 py-3 text-sm font-medium shadow">Available after clinic approval</p></div>}
        </article>

        <article className={`relative rounded-xl border border-border bg-card p-5 transition-opacity ${optionalLocked ? "pointer-events-none select-none opacity-45 grayscale" : ""}`}>
          <div className="mb-5 flex items-center gap-3"><span className="rounded-lg bg-primary/10 p-2 text-primary"><Car size={20} /></span><div><h3 className="text-lg font-semibold">Transfer</h3><p className="text-sm text-muted-foreground">Airport and clinic rides</p></div></div>
          <button type="button" aria-pressed={transferSelected} onClick={() => setTransferSelected(!transferSelected)} className={`w-full rounded-lg border p-4 text-left transition-colors ${transferSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
            <span className="flex items-center justify-between gap-3 font-medium">Complete transfer package{transferSelected && <Check size={17} className="text-primary" />}</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">Round-trip airport pickup and daily hotel to clinic rides.</span>
            <span className="mt-3 block font-semibold text-primary">{money(80)} total</span>
            <span className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground"><Plane size={15} />Airport transfer <span className="ml-auto">{money(50)}</span></span>
            <span className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Car size={15} />Clinic transfers <span className="ml-auto">{money(30)}</span></span>
          </button>
          {optionalLocked && <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/20 p-5 text-center"><p className="rounded-lg bg-card/95 px-4 py-3 text-sm font-medium shadow">Available after clinic approval</p></div>}
        </article>
      </div>
        </div>

        <aside className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-primary/5 xl:sticky xl:top-24" aria-live="polite">
          <div className="border-b border-border bg-primary/[0.04] px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Booking summary</p>
            <h3 className="mt-1 text-2xl font-bold">Your booking</h3>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <div className="space-y-1 border-b border-border pb-4">
              <div className="flex items-center justify-between gap-4 text-sm"><span className="text-muted-foreground">Clinic treatment</span><span className="font-semibold">{details.price === null ? "Pending" : money(details.price)}</span></div>
              <p className="font-semibold">{details.procedure}</p>
              <p className="text-sm text-muted-foreground">{details.clinicName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(details.finalStartDate || details.startDate)}{(details.finalEndDate || details.endDate) ? ` – ${formatDate(details.finalEndDate || details.endDate)}` : ""}</p>
            </div>
            {accommodation && <div className="flex items-start justify-between gap-4 border-b border-border pb-4 text-sm"><span><span className="block font-medium">Accommodation</span><span className="mt-1 block text-xs text-muted-foreground">{accommodation.name} · {nights} night{nights === 1 ? "" : "s"}</span></span><span className="font-semibold">{money(accommodationTotal)}</span></div>}
            {transferSelected && <div className="flex justify-between gap-4 border-b border-border pb-4 text-sm"><span className="font-medium">Transfer package</span><span className="font-semibold">{money(80)}</span></div>}
            <div className="flex justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm"><span><span className="block font-medium">ClinicTrip fee</span><span className="text-xs text-muted-foreground">Service fee</span></span><span className="font-semibold">{money(clinicTripFee)}</span></div>
            <div className="flex items-end justify-between gap-4 pt-1"><span className="font-semibold">Estimated total</span><span className="text-3xl font-bold tracking-tight text-primary">{details.price === null ? "Pending" : money(total)}</span></div>
            {details.price === null && <p className="text-xs text-muted-foreground">The clinic has not set the consultation price yet.</p>}
            <button type="button" className="w-full rounded-xl bg-orange-500 px-5 py-4 text-base font-bold text-white shadow-md shadow-orange-500/20 transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">Submit booking</button>
            <p className="text-center text-xs leading-5 text-muted-foreground">Booking submission will be available soon. This button is for display only.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

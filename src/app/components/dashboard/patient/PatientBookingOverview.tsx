import {
  BedDouble,
  Check,
  CheckCircle2,
  Clock3,
  Hotel,
  MapPin,
  Plane,
  Stethoscope,
  UserRound,
} from "lucide-react";

const timeline = [
  { label: "Consultation requested", date: "March 18, 2026", complete: true },
  { label: "Clinic proposal accepted", date: "March 20, 2026", complete: true },
  { label: "Processing fee payment", date: "Due now", complete: false },
  { label: "Surgery and arrival", date: "May 15, 2026", complete: false },
];

export default function PatientBookingOverview() {
  return (
    <section aria-labelledby="overview-heading">
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Your trip
        </p>
        <h2 id="overview-heading" className="text-2xl font-bold">
          Booking overview
        </h2>
        <p className="mt-2 text-muted-foreground">
          Everything you need for your upcoming surgery in one place.
        </p>
      </div>

      <div className="mb-6 rounded-lg bg-primary p-6 text-primary-foreground">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-primary-foreground/75">Upcoming surgery</p>
            <h3 className="mt-1 text-2xl font-bold">May 15, 2026</h3>
            <p className="mt-2 text-primary-foreground/80">Rhinoplasty · Confirmed booking</p>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium">Confirmed</span>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <Stethoscope className="text-primary" size={21} />
            <h3 className="font-semibold">Clinic and doctor</h3>
          </div>
          <p className="font-medium">Istanbul Medical Center</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <UserRound size={15} /> Dr. Mehmet Yilmaz
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={15} /> Istanbul, Turkey
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <Hotel className="text-primary" size={21} />
            <h3 className="font-semibold">Stay and transfer</h3>
          </div>
          <p className="font-medium">Partner Hotel Premium</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <BedDouble size={15} /> Single room · 5 nights
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Plane size={15} /> Airport transfer selected
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Booking status</h3>
            <p className="mt-1 text-sm text-muted-foreground">Track each step before arrival.</p>
          </div>
          <Clock3 className="text-muted-foreground" size={21} />
        </div>
        <div className="space-y-5">
          {timeline.map((step, index) => (
            <div key={step.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${step.complete ? "bg-green-100 text-green-700" : "bg-accent text-muted-foreground"}`}>
                  {step.complete ? <Check size={15} /> : <span className="h-2 w-2 rounded-full bg-current" />}
                </span>
                {index < timeline.length - 1 && <span className="mt-1 h-full w-px bg-border" />}
              </div>
              <div className="pb-1">
                <p className="font-medium">{step.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        <CheckCircle2 className="mt-0.5 shrink-0 text-green-600" size={18} />
        Your final surgery dates are confirmed. Review your invoices before completing payment.
      </div>
    </section>
  );
}
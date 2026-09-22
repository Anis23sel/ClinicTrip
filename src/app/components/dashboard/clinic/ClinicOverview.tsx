import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  DollarSign,
  Plus,
  Stethoscope,
  Users,
} from "lucide-react";

type ClinicBookingRecord = {
  id: string;
  patientName: string;
  procedure: string | null;
  startDate: string | null;
  finalStartDate: string | null;
  clinicDecision: boolean;
  patientDecision: boolean;
  price: number | null;
};

type Tab = "profile" | "doctors" | "procedures" | "accommodations" | "bookings";

type Props = {
  clinicName: string;
  bookings: ClinicBookingRecord[];
  onNavigate: (tab: Tab) => void;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function getBookingDate(booking: ClinicBookingRecord) {
  return booking.finalStartDate || booking.startDate;
}

export default function ClinicOverview({ clinicName, bookings, onNavigate }: Props) {
  const pending = bookings.filter((booking) => !booking.clinicDecision).length;
  const confirmed = bookings.filter((booking) => booking.clinicDecision && booking.patientDecision).length;
  const upcoming = bookings
    .filter((booking) => {
      const date = getBookingDate(booking);
      return Boolean(date && date >= new Date().toISOString().slice(0, 10));
    })
    .sort((a, b) => (getBookingDate(a) || "").localeCompare(getBookingDate(b) || ""));

  return (
    <section aria-labelledby="clinic-overview-heading">
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Practice overview
        </p>
        <h2 id="clinic-overview-heading" className="text-2xl font-bold">
          Welcome back, {clinicName}
        </h2>
        <p className="mt-2 text-muted-foreground">
          Keep consultations, confirmed procedures, and your clinic schedule moving.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New requests" value={String(bookings.length)} detail="All consultation requests" icon={ClipboardList} tone="primary" />
        <StatCard label="Pending review" value={String(pending)} detail="Need your attention" icon={Clock3} />
        <StatCard label="Confirmed bookings" value={String(confirmed)} detail="Accepted by both sides" icon={CheckCircle2} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold">Upcoming procedures</h3>
              <p className="mt-1 text-sm text-muted-foreground">Your next scheduled patient appointments.</p>
            </div>
            <CalendarDays className="text-muted-foreground" size={21} />
          </div>
          {upcoming.length === 0 ? (
            <p className="rounded-lg bg-accent p-4 text-sm text-muted-foreground">No upcoming procedures are scheduled yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {upcoming.slice(0, 4).map((booking) => (
                <div key={booking.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium">{booking.patientName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{booking.procedure || "Procedure not specified"}</p>
                  </div>
                  <p className="text-sm font-medium text-primary">{getBookingDate(booking)}</p>
                </div>
              ))}
            </div>
          )}
          <button type="button" onClick={() => onNavigate("bookings")} className="mt-5 flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            Review consultations <ArrowRight size={16} />
          </button>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-semibold">Quick actions</h3>
          <p className="mt-1 text-sm text-muted-foreground">Jump directly to your most common tasks.</p>
          <div className="mt-5 space-y-3">
            <QuickAction label="Review consultation requests" icon={ClipboardList} onClick={() => onNavigate("bookings")} />
            <QuickAction label="Update availability" icon={CalendarDays} onClick={() => onNavigate("bookings")} />
            <QuickAction label="Manage doctors" icon={Users} onClick={() => onNavigate("doctors")} />
            <QuickAction label="Manage procedures" icon={Stethoscope} onClick={() => onNavigate("procedures")} />
          </div>
        </section>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        <Plus className="mt-0.5 shrink-0 text-primary" size={18} />
        Keep your procedures, prices, doctors, and availability up to date so patients receive accurate proposals.
      </div>
    </section>
  );
}

function StatCard({ label, value, detail, icon: Icon, tone = "default" }: { label: string; value: string; detail: string; icon: typeof ClipboardList; tone?: "default" | "primary" }) {
  return (
    <div className={`rounded-lg border p-5 ${tone === "primary" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-sm ${tone === "primary" ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{label}</p>
        <Icon size={19} className={tone === "primary" ? "text-primary-foreground/75" : "text-primary"} />
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className={`mt-1 text-xs ${tone === "primary" ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{detail}</p>
    </div>
  );
}

function QuickAction({ label, icon: Icon, onClick }: { label: string; icon: typeof ClipboardList; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-lg border border-border px-3 py-3 text-left text-sm font-medium transition-colors hover:bg-accent">
      <Icon size={18} className="text-primary" />
      <span className="flex-1">{label}</span>
      <ArrowRight size={16} className="text-muted-foreground" />
    </button>
  );
}
import { ArrowLeft } from "lucide-react";
import FinalDateRangePicker from "./FinalDateRangePicker";
import type { Booking, DateInput } from "./bookingTypes";
import { Status } from "./BookingList";

type BookingDetailsProps = {
  booking: Booking;
  dateInput?: DateInput;
  priceInput: string;
  savingDates: boolean;
  savingPrice: boolean;
  accepting: boolean;
  contacting: boolean;
  sending: boolean;
  subject: string;
  message: string;
  dateError: string | null;
  dateSuccess: string | null;
  priceError: string | null;
  priceSuccess: string | null;
  sendError: string;
  sendSuccess: string;
  onBack: () => void;
  onDateChange: (range: DateInput) => void;
  onSaveDates: () => void;
  onPriceChange: (value: string) => void;
  onSavePrice: () => void;
  onContact: () => void;
  onAccept: () => void;
  onSubjectChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onCloseContact: () => void;
  onSendEmail: () => void;
};

export default function BookingDetails({
  booking,
  dateInput,
  priceInput,
  savingDates,
  savingPrice,
  accepting,
  contacting,
  sending,
  subject,
  message,
  dateError,
  dateSuccess,
  priceError,
  priceSuccess,
  sendError,
  sendSuccess,
  onBack,
  onDateChange,
  onSaveDates,
  onPriceChange,
  onSavePrice,
  onContact,
  onAccept,
  onSubjectChange,
  onMessageChange,
  onCloseContact,
  onSendEmail,
}: BookingDetailsProps) {
  return (
    <div>
      <button type="button" onClick={onBack} className="mb-5 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft size={18} />
        Back to consultations
      </button>

      <section className="mb-5 rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-2xl font-bold">{booking.patientName}</h3>
            <p className="mt-1 text-muted-foreground">{booking.procedure || "Procedure not specified"}</p>
          </div>
          <Status clinicDecision={booking.clinicDecision} />
        </div>
      </section>

      <section className="mb-5 rounded-lg border border-border bg-card p-6">
        <h4 className="mb-4 text-lg font-semibold">Request Information</h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Procedure" value={booking.procedure || "Not specified"} />
          <Metric label="Requested Start" value={booking.startDate || "Not specified"} />
          <Metric label="Requested End" value={booking.endDate || "Not specified"} />
          <Metric label="Final Start" value={booking.finalStartDate || "TBD"} />
          <Metric label="Final End" value={booking.finalEndDate || "TBD"} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Metric label="Assigned Doctor" value="TBD" />
          <Metric label="Proposed Price" value={booking.price !== null ? `$${booking.price.toLocaleString()}` : "TBD"} />
        </div>
      </section>

      <section className="mb-5 rounded-lg border border-border bg-card p-6">
        <h4 className="mb-3 font-semibold">Set Final Procedure Dates</h4>
        <p className="mb-4 text-sm text-muted-foreground">Choose the final start and end dates for the procedure. These dates will be shown to the patient.</p>
        <FinalDateRangePicker
          startDate={dateInput?.startDate ?? booking.finalStartDate ?? ""}
          endDate={dateInput?.endDate ?? booking.finalEndDate ?? ""}
          onChange={onDateChange}
          disabled={savingDates}
        />
        <button type="button" onClick={onSaveDates} disabled={savingDates} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {savingDates ? "Saving..." : booking.finalStartDate && booking.finalEndDate ? "Update Dates" : "Set Final Dates"}
        </button>
        <Feedback error={dateError} success={dateSuccess} />
      </section>

      <section className="mb-5 rounded-lg border border-border bg-card p-6">
        <h4 className="mb-3 font-semibold">Set Treatment Price</h4>
        <p className="mb-3 text-sm text-muted-foreground">Enter the price you want to propose to the patient.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label htmlFor={`price-${booking.id}`} className="flex-1 text-sm font-medium">
            Price
            <span className="relative mt-1 block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <input id={`price-${booking.id}`} type="text" inputMode="decimal" value={priceInput} onChange={(event) => onPriceChange(event.target.value)} placeholder={booking.price !== null ? String(booking.price) : "Enter price"} disabled={savingPrice} className="w-full rounded-md border border-border bg-background py-2 pl-7 pr-3 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
            </span>
          </label>
          <button type="button" onClick={onSavePrice} disabled={savingPrice} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {savingPrice ? "Saving..." : booking.price !== null ? "Update Price" : "Set Price"}
          </button>
        </div>
        <Feedback error={priceError} success={priceSuccess} />
      </section>

      <div className="mb-5 flex flex-wrap gap-3">
        <button type="button" onClick={onContact} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Contact Patient</button>
        {booking.inquiryCompleted && !booking.clinicDecision && (
          <button type="button" onClick={onAccept} disabled={accepting} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
            {accepting ? "Accepting..." : "Accept consultation"}
          </button>
        )}
      </div>

      {contacting && (
        <section className="rounded-lg border border-border bg-card p-5">
          <h4 className="mb-4 text-lg font-semibold">Contact {booking.patientName}</h4>
          <div className="space-y-4">
            <label className="block text-sm font-medium">Subject
              <input type="text" value={subject} onChange={(event) => onSubjectChange(event.target.value)} placeholder="Email subject" disabled={sending} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary" />
            </label>
            <label className="block text-sm font-medium">Message
              <textarea value={message} onChange={(event) => onMessageChange(event.target.value)} rows={6} placeholder="Write your message to the patient..." disabled={sending} className="mt-1 w-full resize-none rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary" />
            </label>
            <Feedback error={sendError} success={sendSuccess} />
            <div className="flex gap-3">
              <button type="button" onClick={onCloseContact} disabled={sending} className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">Cancel</button>
              <button type="button" onClick={onSendEmail} disabled={sending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">{sending ? "Sending..." : "Send Email"}</button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Feedback({ error, success }: { error?: string | null; success?: string | null }) {
  if (error) return <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>;
  if (success) return <p className="mt-3 text-sm text-green-600">{success}</p>;
  return null;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-sm text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>;
}

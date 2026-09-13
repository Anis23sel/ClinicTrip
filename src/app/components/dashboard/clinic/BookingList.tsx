import type { Booking } from "./bookingTypes";

export default function BookingList({
  bookings,
  onManage,
}: {
  bookings: Booking[];
  onManage: (booking: Booking) => void;
}) {
  const sortedBookings = [...bookings].sort((a, b) => {
    if (a.clinicDecision !== b.clinicDecision) {
      return a.clinicDecision ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="space-y-3">
      {sortedBookings.map((booking) => (
        <div key={booking.id} className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold">{booking.patientName}</h3>
                <Status clinicDecision={booking.clinicDecision} />
              </div>
              <p className="mb-2 text-sm text-muted-foreground">
                {booking.procedure || "Procedure not specified"}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                <span>
                  Requested: {booking.startDate || "Not specified"} - {booking.endDate || "Not specified"}
                </span>
                {booking.price !== null && <span>Price: ${booking.price.toLocaleString()}</span>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onManage(booking)}
              className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Manage consultation
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Status({ clinicDecision }: { clinicDecision: boolean }) {
  return clinicDecision ? (
    <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
      <span aria-hidden="true">&#10003;</span>
      <span>Validated</span>
    </div>
  ) : (
    <div className="flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800">
      <span aria-hidden="true">&#9679;</span>
      <span>Pending</span>
    </div>
  );
}

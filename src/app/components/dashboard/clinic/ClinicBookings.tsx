"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";

type Booking = {
  id: string;
  patientName: string;
  patientEmail: string;
  startDate: string | null;
  endDate: string | null;
  finalStartDate: string | null;
  finalEndDate: string | null;
  inquiryCompleted: boolean;
  clinicDecision: boolean;
  patientDecision: boolean;
  price: number | null;
};

const supabase = createClient();

export default function ClinicBookings({
  clinicId,
}: {
  clinicId: string;
}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [contactingBooking, setContactingBooking] = useState<string | null>(
    null
  );

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  const [accepting, setAccepting] = useState<string | null>(null);

  // ============================================================
  // PRICE STATE
  // ============================================================

  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [savingPrice, setSavingPrice] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceSuccess, setPriceSuccess] = useState<string | null>(null);

  // ============================================================
  // FINAL DATE STATE
  // ============================================================

  const [dateInputs, setDateInputs] = useState<
    Record<string, { startDate: string; endDate: string }>
  >({});

  const [savingDates, setSavingDates] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [dateSuccess, setDateSuccess] = useState<string | null>(null);

  // ============================================================
  // LOAD BOOKINGS
  // ============================================================

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const { data: rows, error: requestError } = await supabase
          .from("Patient_request")
          .select(
            `
              id,
              id_patient,
              id_clinic,
              start_date,
              end_date,
              final_start_date,
              final_end_date,
              inquiry_completed,
              clinic_decision,
              patient_decision,
              price
            `
          )
          .eq("id_clinic", clinicId)
          .order("created_at", { ascending: false });

        if (requestError) throw requestError;

        // ============================================================
        // GET PATIENT IDS
        // ============================================================

        const patientIds = [
          ...new Set((rows || []).map((row) => row.id_patient)),
        ];

        // ============================================================
        // GET PATIENTS
        // ============================================================

        const { data: patients, error: patientError } = patientIds.length
          ? await supabase
              .from("patients")
              .select("id, first_name, last_name, email")
              .in("id", patientIds)
          : { data: [], error: null };

        if (patientError) throw patientError;

        // ============================================================
        // CREATE PATIENT MAP
        // ============================================================

        const patientMap = new Map(
          (patients || []).map((patient) => [
            String(patient.id),
            {
              name: [patient.first_name, patient.last_name]
                .filter(Boolean)
                .join(" "),

              email: patient.email || "",
            },
          ])
        );

        // ============================================================
        // BUILD BOOKINGS
        // ============================================================

        setBookings(
          (rows || []).map((row) => {
            const patient = patientMap.get(String(row.id_patient));

            return {
              id: String(row.id),

              patientName: patient?.name || "Patient",

              patientEmail: patient?.email || "",

              startDate: row.start_date,

              endDate: row.end_date,

              finalStartDate: row.final_start_date,

              finalEndDate: row.final_end_date,

              inquiryCompleted: row.inquiry_completed ?? false,

              clinicDecision: row.clinic_decision ?? false,

              patientDecision: row.patient_decision ?? false,

              // Price from Patient_request
              price:
                row.price !== null && row.price !== undefined
                  ? Number(row.price)
                  : null,
            };
          })
        );
      } catch (loadError) {
        console.error("Failed to load clinic bookings:", loadError);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "We could not load clinic bookings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [clinicId]);

  // ============================================================
  // PRICE HANDLERS
  // ============================================================

  const handlePriceChange = (bookingId: string, value: string) => {
    // Only allow numbers and decimal point
    if (!/^\d*\.?\d*$/.test(value)) {
      return;
    }

    setPriceInputs((current) => ({
      ...current,
      [bookingId]: value,
    }));

    setPriceError(null);
    setPriceSuccess(null);
  };

  const handleSavePrice = async (booking: Booking) => {
    const inputValue = priceInputs[booking.id] ?? "";

    if (!inputValue.trim()) {
      setPriceError("Please enter a price before saving.");
      setPriceSuccess(null);
      return;
    }

    const price = Number(inputValue);

    if (!Number.isFinite(price)) {
      setPriceError("Please enter a valid price.");
      setPriceSuccess(null);
      return;
    }

    if (price < 0) {
      setPriceError("Price cannot be negative.");
      setPriceSuccess(null);
      return;
    }

    setSavingPrice(booking.id);
    setPriceError(null);
    setPriceSuccess(null);

    try {
      const { error: updateError } = await supabase
        .from("Patient_request")
        .update({
          price: price,
        })
        .eq("id", booking.id)
        .eq("id_clinic", clinicId);

      if (updateError) {
        throw updateError;
      }

      // Update local booking immediately
      setBookings((currentBookings) =>
        currentBookings.map((currentBooking) =>
          currentBooking.id === booking.id
            ? {
                ...currentBooking,
                price,
              }
            : currentBooking
        )
      );

      setPriceInputs((current) => ({
        ...current,
        [booking.id]: "",
      }));

      setPriceSuccess(
        `Price saved successfully: $${price.toLocaleString()}`
      );
    } catch (error) {
      console.error("Failed to update price:", error);

      setPriceError(
        error instanceof Error
          ? error.message
          : "We could not update the price."
      );
    } finally {
      setSavingPrice(null);
    }
  };

  // ============================================================
  // FINAL DATE HANDLERS
  // ============================================================

  const handleDateChange = (
    bookingId: string,
    field: "startDate" | "endDate",
    value: string
  ) => {
    setDateInputs((current) => ({
      ...current,
      [bookingId]: {
        startDate: current[bookingId]?.startDate ?? "",
        endDate: current[bookingId]?.endDate ?? "",
        [field]: value,
      },
    }));

    setDateError(null);
    setDateSuccess(null);
  };

  const handleSaveDates = async (booking: Booking) => {
    const input = dateInputs[booking.id];

    const startDate = input?.startDate ?? "";
    const endDate = input?.endDate ?? "";

    if (!startDate || !endDate) {
      setDateError("Please select both a start date and an end date.");
      setDateSuccess(null);
      return;
    }

    if (endDate < startDate) {
      setDateError("End date cannot be before the start date.");
      setDateSuccess(null);
      return;
    }

    setSavingDates(booking.id);
    setDateError(null);
    setDateSuccess(null);

    try {
      const { error: updateError } = await supabase
        .from("Patient_request")
        .update({
          final_start_date: startDate,
          final_end_date: endDate,
        })
        .eq("id", booking.id)
        .eq("id_clinic", clinicId);

      if (updateError) {
        throw updateError;
      }

      // Update local booking immediately
      setBookings((currentBookings) =>
        currentBookings.map((currentBooking) =>
          currentBooking.id === booking.id
            ? {
                ...currentBooking,
                finalStartDate: startDate,
                finalEndDate: endDate,
              }
            : currentBooking
        )
      );

      setDateInputs((current) => ({
        ...current,
        [booking.id]: {
          startDate: "",
          endDate: "",
        },
      }));

      setDateSuccess("Final procedure dates saved successfully.");
    } catch (error) {
      console.error("Failed to update final dates:", error);

      setDateError(
        error instanceof Error
          ? error.message
          : "We could not update the final dates."
      );
    } finally {
      setSavingDates(null);
    }
  };

  // ============================================================
  // CONTACT PATIENT
  // ============================================================

  const openContactForm = (booking: Booking) => {
    setContactingBooking(booking.id);
    setSubject(`Regarding your ClinicTrip request`);
    setMessage("");
    setSendError("");
    setSendSuccess("");
  };

  const closeContactForm = () => {
    setContactingBooking(null);
    setSubject("");
    setMessage("");
    setSendError("");
    setSendSuccess("");
  };

  const handleSendEmail = async (booking: Booking) => {
    if (!subject.trim()) {
      setSendError("Subject is required.");
      return;
    }

    if (!message.trim()) {
      setSendError("Message is required.");
      return;
    }

    setSending(true);
    setSendError("");
    setSendSuccess("");

    try {
      const response = await fetch("/api/clinic/contact-patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: booking.id,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Email delivery failed.");
      }

      setSendSuccess("Email sent successfully.");

      setTimeout(() => {
        closeContactForm();
      }, 1500);
    } catch (error) {
      console.error("Failed to send email:", error);

      setSendError(
        error instanceof Error
          ? error.message
          : "Email delivery failed. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // ACCEPT REQUEST
  // ============================================================

  const handleAcceptRequest = async (booking: Booking) => {
    setAccepting(booking.id);

    try {
      const response = await fetch("/api/clinic/accept-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: booking.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to accept request.");
      }

      setBookings((currentBookings) =>
        currentBookings.map((currentBooking) =>
          currentBooking.id === booking.id
            ? {
                ...currentBooking,
                clinicDecision: true,
              }
            : currentBooking
        )
      );
    } catch (error) {
      console.error("Failed to accept request:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to accept request."
      );
    } finally {
      setAccepting(null);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold">Booking Management</h2>

      {loading && (
        <p className="text-muted-foreground">Loading bookings...</p>
      )}

      {!loading && error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}

      {!loading && !error && bookings.length === 0 && (
        <p className="text-muted-foreground">
          No patient requests found for this clinic.
        </p>
      )}

      <div className="space-y-4">
        {!loading &&
          !error &&
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-lg border border-border bg-card p-6"
            >
              {/* ==================================================
                  HEADER
              ================================================== */}

              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="mb-1 text-xl font-semibold">
                    {booking.patientName}
                  </h3>

                  <p className="text-muted-foreground">
                    Patient request
                  </p>
                </div>

                <Status clinicDecision={booking.clinicDecision} />
              </div>

              {/* ==================================================
                  REQUEST INFORMATION
              ================================================== */}

              <div className="mb-4 grid gap-4 md:grid-cols-4">
                <Metric
                  label="Requested Start"
                  value={booking.startDate || "Not specified"}
                />

                <Metric
                  label="Requested End"
                  value={booking.endDate || "Not specified"}
                />

                <Metric
                  label="Final Start"
                  value={booking.finalStartDate || "TBD"}
                />

                <Metric
                  label="Final End"
                  value={booking.finalEndDate || "TBD"}
                />
              </div>

              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <Metric label="Assigned Doctor" value="TBD" />

                <Metric
                  label="Proposed Price"
                  value={
                    booking.price !== null
                      ? `$${booking.price.toLocaleString()}`
                      : "TBD"
                  }
                />
              </div>

              {/* ==================================================
                  FINAL DATE EDITOR
              ================================================== */}

              <div className="mb-5 rounded-lg border border-border bg-background p-4">
                <h4 className="mb-3 font-semibold">
                  Set Final Procedure Dates
                </h4>

                <p className="mb-3 text-sm text-muted-foreground">
                  Choose the final start and end dates for the procedure.
                  These dates will be shown to the patient.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* FINAL START DATE */}

                  <div>
                    <label
                      htmlFor={`final-start-${booking.id}`}
                      className="mb-1 block text-sm font-medium"
                    >
                      Final Start Date
                    </label>

                    <input
                      id={`final-start-${booking.id}`}
                      type="date"
                      value={
                        dateInputs[booking.id]?.startDate ??
                        booking.finalStartDate ??
                        ""
                      }
                      onChange={(e) =>
                        handleDateChange(
                          booking.id,
                          "startDate",
                          e.target.value
                        )
                      }
                      disabled={savingDates === booking.id}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                  </div>

                  {/* FINAL END DATE */}

                  <div>
                    <label
                      htmlFor={`final-end-${booking.id}`}
                      className="mb-1 block text-sm font-medium"
                    >
                      Final End Date
                    </label>

                    <input
                      id={`final-end-${booking.id}`}
                      type="date"
                      min={
                        dateInputs[booking.id]?.startDate ||
                        booking.finalStartDate ||
                        undefined
                      }
                      value={
                        dateInputs[booking.id]?.endDate ??
                        booking.finalEndDate ??
                        ""
                      }
                      onChange={(e) =>
                        handleDateChange(
                          booking.id,
                          "endDate",
                          e.target.value
                        )
                      }
                      disabled={savingDates === booking.id}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveDates(booking)}
                  disabled={savingDates === booking.id}
                  className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {savingDates === booking.id
                    ? "Saving..."
                    : booking.finalStartDate && booking.finalEndDate
                    ? "Update Dates"
                    : "Set Final Dates"}
                </button>

                {dateError && (
                  <p
                    role="alert"
                    className="mt-3 text-sm text-destructive"
                  >
                    {dateError}
                  </p>
                )}

                {dateSuccess && (
                  <p className="mt-3 text-sm text-green-600">
                    {dateSuccess}
                  </p>
                )}
              </div>

              {/* ==================================================
                  PRICE EDITOR
              ================================================== */}

              <div className="mb-5 rounded-lg border border-border bg-background p-4">
                <h4 className="mb-3 font-semibold">
                  Set Treatment Price
                </h4>

                <p className="mb-3 text-sm text-muted-foreground">
                  Enter the price you want to propose to the patient.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label
                      htmlFor={`price-${booking.id}`}
                      className="mb-1 block text-sm font-medium"
                    >
                      Price
                    </label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>

                      <input
                        id={`price-${booking.id}`}
                        type="text"
                        inputMode="decimal"
                        value={priceInputs[booking.id] ?? ""}
                        onChange={(e) =>
                          handlePriceChange(
                            booking.id,
                            e.target.value
                          )
                        }
                        placeholder={
                          booking.price !== null
                            ? String(booking.price)
                            : "Enter price"
                        }
                        disabled={savingPrice === booking.id}
                        className="w-full rounded-md border border-border bg-background py-2 pl-7 pr-3 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSavePrice(booking)}
                    disabled={savingPrice === booking.id}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {savingPrice === booking.id
                      ? "Saving..."
                      : booking.price !== null
                      ? "Update Price"
                      : "Set Price"}
                  </button>
                </div>

                {priceError && (
                  <p
                    role="alert"
                    className="mt-3 text-sm text-destructive"
                  >
                    {priceError}
                  </p>
                )}

                {priceSuccess && (
                  <p className="mt-3 text-sm text-green-600">
                    {priceSuccess}
                  </p>
                )}
              </div>

              {/* ==================================================
                  ACTION BUTTONS
              ================================================== */}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => openContactForm(booking)}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Contact Patient
                </button>

                {booking.inquiryCompleted &&
                  !booking.clinicDecision && (
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(booking)}
                      disabled={accepting === booking.id}
                      className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {accepting === booking.id
                        ? "Accepting..."
                        : "Accept Request"}
                    </button>
                  )}
              </div>

              {/* ==================================================
                  CONTACT FORM
              ================================================== */}

              {contactingBooking === booking.id && (
                <div className="mt-5 rounded-lg border border-border bg-background p-5">
                  <h4 className="mb-4 text-lg font-semibold">
                    Contact {booking.patientName}
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Subject
                      </label>

                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Email subject"
                        disabled={sending}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Message
                      </label>

                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Write your message to the patient..."
                        disabled={sending}
                      />
                    </div>

                    {sendError && (
                      <p role="alert" className="text-sm text-destructive">
                        {sendError}
                      </p>
                    )}

                    {sendSuccess && (
                      <p className="text-sm text-green-600">
                        {sendSuccess}
                      </p>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={closeContactForm}
                        disabled={sending}
                        className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendEmail(booking)}
                        disabled={sending}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                      >
                        {sending ? "Sending..." : "Send Email"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </section>
  );
}

// ================================================================
// STATUS COMPONENT
// ================================================================

function Status({
  clinicDecision,
}: {
  clinicDecision: boolean;
}) {
  if (clinicDecision) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
        <CheckCircle size={16} />
        <span>Validated</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800">
      <Clock size={16} />
      <span>Pending</span>
    </div>
  );
}

// ================================================================
// METRIC COMPONENT
// ================================================================

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>

      <p className="font-medium">{value}</p>
    </div>
  );
}

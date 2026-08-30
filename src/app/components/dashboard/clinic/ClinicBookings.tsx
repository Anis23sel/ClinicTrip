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
  inquiryCompleted: boolean;
  clinicDecision: boolean;
  patientDecision: boolean;
};

const supabase = createClient();

export default function ClinicBookings({ clinicId }: { clinicId: string }) {
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

  useEffect(() => {
    const loadBookings = async () => {
      const { data: rows, error: requestError } = await supabase
        .from("Patient_request")
        .select("id, id_patient, id_clinic, start_date, end_date, inquiry_completed, clinic_decision, patient_decision")
        .eq("id_clinic", clinicId)
        .order("created_at", { ascending: false });

      if (requestError) throw requestError;

      const patientIds = [
        ...new Set((rows || []).map((row) => row.id_patient)),
      ];

      const { data: patients, error: patientError } = patientIds.length
        ? await supabase
            .from("patients")
            .select("id, first_name, last_name, email")
            .in("id", patientIds)
        : { data: [], error: null };

      if (patientError) throw patientError;

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

      setBookings(
        (rows || []).map((row) => {
          const patient = patientMap.get(String(row.id_patient));

          return {
            id: String(row.id),
            patientName: patient?.name || "Patient",
            patientEmail: patient?.email || "",
            startDate: row.start_date,
            endDate: row.end_date,
            inquiryCompleted: row.inquiry_completed,
            clinicDecision: row.clinic_decision,
            patientDecision: row.patient_decision,
          };
        })
      );
    };

    loadBookings()
      .catch((loadError) => {
        console.error("Failed to load clinic bookings:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "We could not load clinic bookings."
        );
      })
      .finally(() => setLoading(false));
  }, [clinicId]);

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
        throw new Error(
          result.error || "Failed to accept request."
        );
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
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="mb-1 text-xl font-semibold">
                    {booking.patientName}
                  </h3>

                  <p className="text-muted-foreground">Patient request</p>
                </div>

                <Status clinicDecision={booking.clinicDecision} />
              </div>

              <div className="mb-4 grid gap-4 md:grid-cols-3">
                <Metric
                  label="Start date"
                  value={booking.startDate || "Not specified"}
                />

                <Metric
                  label="End date"
                  value={booking.endDate || "Not specified"}
                />

                <Metric label="Assigned Doctor" value={"TBD"} />
              </div>

              <div className="flex gap-3">
  <button
    type="button"
    onClick={() => openContactForm(booking)}
    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
  >
    Contact Patient
  </button>

  {booking.inquiryCompleted && !booking.clinicDecision && (
    <button
      type="button"
      onClick={() => handleAcceptRequest(booking)}
      className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
    >
      Accept Request
    </button>
  )}
</div>

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

function Status({ clinicDecision }: { clinicDecision: boolean }) {
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
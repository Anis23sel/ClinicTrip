"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import BookingDetails from "./BookingDetails";
import BookingFilters, { type BookingFiltersValue } from "./BookingFilters";
import BookingList from "./BookingList";
import type { Booking, DateInput } from "./bookingTypes";

const supabase = createClient();

type ContactState = {
  bookingId: string | null;
  subject: string;
  message: string;
};

export default function ClinicBookings({ clinicId }: { clinicId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [contact, setContact] = useState<ContactState>({ bookingId: null, subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");
  const [accepting, setAccepting] = useState<string | null>(null);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [savingPrice, setSavingPrice] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceSuccess, setPriceSuccess] = useState<string | null>(null);
  const [dateInputs, setDateInputs] = useState<Record<string, DateInput>>({});
  const [savingDates, setSavingDates] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [dateSuccess, setDateSuccess] = useState<string | null>(null);
  const [filters, setFilters] = useState<BookingFiltersValue>({
    name: "",
    surgery: "",
    dates: { from: "", to: "" },
  });

  const selectedBooking = bookings.find((booking) => booking.id === selectedBookingId) || null;
  const availableSurgeries = [
    ...new Set(
      bookings
        .map((booking) => booking.procedure)
        .filter((procedure): procedure is string => Boolean(procedure))
    ),
  ].sort();
  const filteredBookings = bookings.filter((booking) => {
    const nameMatches = booking.patientName.toLowerCase().includes(filters.name.trim().toLowerCase());
    const surgeryMatches = (booking.procedure || "").toLowerCase().includes(filters.surgery.trim().toLowerCase());
    const startsBeforeEnd = !filters.dates.to || !booking.startDate || booking.startDate <= filters.dates.to;
    const endsAfterStart = !filters.dates.from || !booking.endDate || booking.endDate >= filters.dates.from;
    return nameMatches && surgeryMatches && startsBeforeEnd && endsAfterStart;
  });

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const { data: rows, error: requestError } = await supabase
          .from("Patient_request")
          .select("id, id_patient, start_date, end_date, final_start_date, final_end_date, procedure, inquiry_completed, clinic_decision, patient_decision, price")
          .eq("id_clinic", clinicId)
          .order("created_at", { ascending: false });
        if (requestError) throw requestError;

        const patientIds = [...new Set((rows || []).map((row) => row.id_patient))];
        const { data: patients, error: patientError } = patientIds.length
          ? await supabase.from("patients").select("id, first_name, last_name, email").in("id", patientIds)
          : { data: [], error: null };
        if (patientError) throw patientError;

        const patientMap = new Map(
          (patients || []).map((patient) => [String(patient.id), {
            name: [patient.first_name, patient.last_name].filter(Boolean).join(" "),
            email: patient.email || "",
          }])
        );

        setBookings((rows || []).map((row) => {
          const patient = patientMap.get(String(row.id_patient));
          return {
            id: String(row.id),
            patientName: patient?.name || "Patient",
            patientEmail: patient?.email || "",
            procedure: row.procedure ?? null,
            startDate: row.start_date,
            endDate: row.end_date,
            finalStartDate: row.final_start_date,
            finalEndDate: row.final_end_date,
            inquiryCompleted: row.inquiry_completed ?? false,
            clinicDecision: row.clinic_decision ?? false,
            patientDecision: row.patient_decision ?? false,
            price: row.price !== null && row.price !== undefined ? Number(row.price) : null,
          };
        }));
      } catch (loadError) {
        console.error("Failed to load clinic bookings:", loadError);
        setError(loadError instanceof Error ? loadError.message : "We could not load clinic bookings.");
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [clinicId]);

  const clearFeedback = () => {
    setPriceError(null);
    setPriceSuccess(null);
    setDateError(null);
    setDateSuccess(null);
  };

  const handleManageRequest = (booking: Booking) => {
    setSelectedBookingId(booking.id);
    clearFeedback();
    closeContactForm();
  };

  const handleBackToRequests = () => {
    setSelectedBookingId(null);
    clearFeedback();
    closeContactForm();
  };

  const handlePriceChange = (bookingId: string, value: string) => {
    if (!/^\d*\.?\d*$/.test(value)) return;
    setPriceInputs((current) => ({ ...current, [bookingId]: value }));
    setPriceError(null);
    setPriceSuccess(null);
  };

  const handleSavePrice = async (booking: Booking) => {
    const inputValue = priceInputs[booking.id] ?? "";
    if (!inputValue.trim()) return setPriceError("Please enter a price before saving.");
    const price = Number(inputValue);
    if (!Number.isFinite(price)) return setPriceError("Please enter a valid price.");
    if (price < 0) return setPriceError("Price cannot be negative.");

    setSavingPrice(booking.id);
    setPriceError(null);
    setPriceSuccess(null);
    try {
      const { error: updateError } = await supabase.from("Patient_request").update({ price }).eq("id", booking.id).eq("id_clinic", clinicId);
      if (updateError) throw updateError;
      setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, price } : item));
      setPriceInputs((current) => ({ ...current, [booking.id]: "" }));
      setPriceSuccess(`Price saved successfully: $${price.toLocaleString()}`);
    } catch (updateError) {
      console.error("Failed to update price:", updateError);
      setPriceError(updateError instanceof Error ? updateError.message : "We could not update the price.");
    } finally {
      setSavingPrice(null);
    }
  };

  const handleDateChange = (bookingId: string, range: DateInput) => {
    setDateInputs((current) => ({ ...current, [bookingId]: range }));
    setDateError(null);
    setDateSuccess(null);
  };

  const handleSaveDates = async (booking: Booking) => {
    const input = dateInputs[booking.id];
    const startDate = input?.startDate ?? "";
    const endDate = input?.endDate ?? "";
    if (!startDate || !endDate) return setDateError("Please select both a start date and an end date.");
    if (endDate < startDate) return setDateError("End date cannot be before the start date.");

    setSavingDates(booking.id);
    setDateError(null);
    setDateSuccess(null);
    try {
      const { error: updateError } = await supabase.from("Patient_request").update({ final_start_date: startDate, final_end_date: endDate }).eq("id", booking.id).eq("id_clinic", clinicId);
      if (updateError) throw updateError;
      setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, finalStartDate: startDate, finalEndDate: endDate } : item));
      setDateInputs((current) => ({ ...current, [booking.id]: { startDate: "", endDate: "" } }));
      setDateSuccess("Final procedure dates saved successfully.");
    } catch (updateError) {
      console.error("Failed to update final dates:", updateError);
      setDateError(updateError instanceof Error ? updateError.message : "We could not update the final dates.");
    } finally {
      setSavingDates(null);
    }
  };

  const openContactForm = (booking: Booking) => {
    setContact({ bookingId: booking.id, subject: "Regarding your ClinicTrip consultation", message: "" });
    setSendError("");
    setSendSuccess("");
  };

  function closeContactForm() {
    setContact({ bookingId: null, subject: "", message: "" });
    setSendError("");
    setSendSuccess("");
  }

  const handleSendEmail = async (booking: Booking) => {
    if (!contact.subject.trim()) return setSendError("Subject is required.");
    if (!contact.message.trim()) return setSendError("Message is required.");
    setSending(true);
    setSendError("");
    setSendSuccess("");
    try {
      const response = await fetch("/api/clinic/contact-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: booking.id, subject: contact.subject.trim(), message: contact.message.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Email delivery failed.");
      setSendSuccess("Email sent successfully.");
      setTimeout(closeContactForm, 1500);
    } catch (sendErrorValue) {
      console.error("Failed to send email:", sendErrorValue);
      setSendError(sendErrorValue instanceof Error ? sendErrorValue.message : "Email delivery failed. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleAcceptRequest = async (booking: Booking) => {
    setAccepting(booking.id);
    try {
      const response = await fetch("/api/clinic/accept-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: booking.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to accept request.");
      setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, clinicDecision: true } : item));
    } catch (acceptError) {
      console.error("Failed to accept consultation:", acceptError);
      alert(acceptError instanceof Error ? acceptError.message : "Failed to accept consultation.");
    } finally {
      setAccepting(null);
    }
  };

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold">Consultation Management</h2>
      {loading && <p className="text-muted-foreground">Loading consultations...</p>}
      {!loading && error && <p role="alert" className="text-destructive">{error}</p>}
      {!loading && !error && bookings.length === 0 && <p className="text-muted-foreground">No patient consultations found for this clinic.</p>}
      {!loading && !error && bookings.length > 0 && !selectedBooking && (
        <>
          <BookingFilters
            value={filters}
            onChange={setFilters}
            resultCount={filteredBookings.length}
            availableSurgeries={availableSurgeries}
          />
          {filteredBookings.length > 0 ? (
            <BookingList bookings={filteredBookings} onManage={handleManageRequest} />
          ) : (
            <p className="text-muted-foreground">No consultations match the selected filters.</p>
          )}
        </>
      )}
      {!loading && !error && selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          dateInput={dateInputs[selectedBooking.id]}
          priceInput={priceInputs[selectedBooking.id] ?? ""}
          savingDates={savingDates === selectedBooking.id}
          savingPrice={savingPrice === selectedBooking.id}
          accepting={accepting === selectedBooking.id}
          contacting={contact.bookingId === selectedBooking.id}
          sending={sending}
          subject={contact.subject}
          message={contact.message}
          dateError={dateError}
          dateSuccess={dateSuccess}
          priceError={priceError}
          priceSuccess={priceSuccess}
          sendError={sendError}
          sendSuccess={sendSuccess}
          onBack={handleBackToRequests}
          onDateChange={(range) => handleDateChange(selectedBooking.id, range)}
          onSaveDates={() => handleSaveDates(selectedBooking)}
          onPriceChange={(value) => handlePriceChange(selectedBooking.id, value)}
          onSavePrice={() => handleSavePrice(selectedBooking)}
          onContact={() => openContactForm(selectedBooking)}
          onAccept={() => handleAcceptRequest(selectedBooking)}
          onSubjectChange={(subject) => setContact((current) => ({ ...current, subject }))}
          onMessageChange={(message) => setContact((current) => ({ ...current, message }))}
          onCloseContact={closeContactForm}
          onSendEmail={() => handleSendEmail(selectedBooking)}
        />
      )}
    </section>
  );
}

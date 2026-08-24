import Link from "next/link";
import { useEffect, useState } from "react";
import BookingCard from "../BookingCard";
import { createClient } from "@/app/utils/supabase/client";

type RequestBooking = {
  id: string;
  clinicId: string;
  clinicName: string;
  procedure: string;
  preferredDate: string;
  doctor: string;
  date: string;
  location: string;
  price: number;
  status: "pending";
  accommodation: string | null;
};

const supabase = createClient();

function formatRequestDate(startDate: string | null, endDate: string | null) {
  if (!startDate) return "Not specified";
  const start = new Date(`${startDate}T00:00:00`).toLocaleDateString();
  if (!endDate || startDate === endDate) return start;
  return `${start} - ${new Date(`${endDate}T00:00:00`).toLocaleDateString()}`;
}

export default function PatientRequests() {
  const [requests, setRequests] = useState<RequestBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRequests = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Please sign in to view your requests.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (profileError || !profile) throw profileError || new Error("We could not find your profile.");

      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .select("id")
        .eq("profile_id", profile.id)
        .maybeSingle();
      if (patientError || !patient) throw patientError || new Error("No patient record is linked to your account.");

      const { data: requestRows, error: requestError } = await supabase
        .from("Patient_request")
        .select("id, created_at, id_patient, id_clinic, start_date, end_date")
        .eq("id_patient", patient.id)
        .order("created_at", { ascending: false });
      if (requestError) throw requestError;

      const clinicIds = [...new Set((requestRows || []).map((request) => request.id_clinic))];
      const { data: clinicRows, error: clinicError } = clinicIds.length
        ? await supabase.from("clinics").select("id, clinic_name, address, country").in("id", clinicIds)
        : { data: [], error: null };
      if (clinicError) throw clinicError;

      const clinics = new Map((clinicRows || []).map((clinic) => [String(clinic.id), clinic]));
      setRequests((requestRows || []).map((request) => {
        const clinic = clinics.get(String(request.id_clinic));
        return {
          id: String(request.id),
          clinicId: String(request.id_clinic),
          clinicName: clinic?.clinic_name || "Clinic request",
          procedure: "Patient request",
          preferredDate: request.start_date || "",
          doctor: "Not assigned",
          date: formatRequestDate(request.start_date, request.end_date),
          location: [clinic?.address, clinic?.country].filter(Boolean).join(", "),
          price: 0,
          status: "pending",
          accommodation: null,
        };
      }));
    };

    loadRequests()
      .catch((loadError) => {
        console.error("Failed to load patient requests:", loadError);
        setError(loadError instanceof Error ? loadError.message : "We could not load your requests right now.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Requests</h2>
        <Link href="/search" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-opacity hover:opacity-90">New Request</Link>
      </div>
      <div className="space-y-4">
        {loading && <p className="text-muted-foreground">Loading your requests...</p>}
        {!loading && error && <p role="alert" className="text-destructive">{error}</p>}
        {!loading && !error && requests.length === 0 && <p className="text-muted-foreground">You have not made any requests yet.</p>}
        {!loading && !error && requests.map((request) => <BookingCard key={request.id} booking={request} />)}
      </div>
    </section>
  );
}

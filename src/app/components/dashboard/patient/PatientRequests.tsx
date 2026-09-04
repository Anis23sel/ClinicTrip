import Link from "next/link";
import { useEffect, useState } from "react";
import BookingCard from "../BookingCard";
import { createClient } from "@/app/utils/supabase/client";

type RequestBooking = {
  id: string;
  clinicId: string;
  clinicName: string;
  procedure: string;
  startDate: string;
  endDate: string;
  doctor: string;
  date: string;
  location: string;
  price: number | null;
  status: "pending";
  accommodation: string | null;
  inquiryCompleted: boolean;
  clinicDecision: boolean;
  patientDecision: boolean;
  finalStartDate: string | null;
  finalEndDate: string | null;
};

const supabase = createClient();

function formatRequestDate(
  startDate: string | null,
  endDate: string | null
) {
  if (!startDate) return "Not specified";

  const start = new Date(
    `${startDate}T00:00:00`
  ).toLocaleDateString();

  if (!endDate || startDate === endDate) {
    return start;
  }

  return `${start} - ${new Date(
    `${endDate}T00:00:00`
  ).toLocaleDateString()}`;
}

export default function PatientRequests() {
  const [requests, setRequests] = useState<RequestBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRequests = async () => {
      try {
        // ============================================================
        // 1. GET AUTHENTICATED USER
        // ============================================================

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          throw new Error(
            "Please sign in to view your requests."
          );
        }

        // ============================================================
        // 2. GET PROFILE
        // ============================================================

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (profileError || !profile) {
          throw (
            profileError ||
            new Error(
              "We could not find your profile."
            )
          );
        }

        // ============================================================
        // 3. GET PATIENT
        // ============================================================

        const { data: patient, error: patientError } =
          await supabase
            .from("patients")
            .select("id")
            .eq("profile_id", profile.id)
            .maybeSingle();

        if (patientError || !patient) {
          throw (
            patientError ||
            new Error(
              "No patient record is linked to your account."
            )
          );
        }

        // ============================================================
        // 4. GET PATIENT REQUESTS
        // ============================================================

        const {
          data: requestRows,
          error: requestError,
        } = await supabase
          .from("Patient_request")
          .select(
            `
              id,
              created_at,
              id_patient,
              id_clinic,
              procedure,
              start_date,
              end_date,
              final_start_date,
              final_end_date,
              inquiry_completed,
              clinic_decision,
              patient_decision,
              doctor_id,
              price
            `
          )
          .eq("id_patient", patient.id)
          .order("created_at", {
            ascending: false,
          });

        if (requestError) {
          throw requestError;
        }

        // ============================================================
        // 5. GET CLINICS
        // ============================================================

        const clinicIds = [
          ...new Set(
            (requestRows || []).map(
              (request) => request.id_clinic
            )
          ),
        ];

        const {
          data: clinicRows,
          error: clinicError,
        } = clinicIds.length
          ? await supabase
              .from("clinics")
              .select(
                "id, clinic_name, address, country"
              )
              .in("id", clinicIds)
          : { data: [], error: null };

        if (clinicError) {
          throw clinicError;
        }

        const clinics = new Map(
          (clinicRows || []).map((clinic) => [
            String(clinic.id),
            clinic,
          ])
        );

        // ============================================================
        // 6. GET DOCTORS
        // ============================================================

        const doctorIds = [
          ...new Set(
            (requestRows || [])
              .map((request) => request.doctor_id)
              .filter(Boolean)
              .map((doctorId) => String(doctorId))
          ),
        ];

        const {
          data: doctorRows,
          error: doctorError,
        } = doctorIds.length
          ? await supabase
              .from("doctors")
              .select(
                "id, first_name, last_name"
              )
              .in("id", doctorIds)
          : { data: [], error: null };

        if (doctorError) {
          throw doctorError;
        }

        // ============================================================
        // Create doctor map
        // doctor ID -> "First Name Last Name"
        // ============================================================

        const doctors = new Map(
          (doctorRows || []).map((doctor) => [
            String(doctor.id),
            `${doctor.first_name || ""} ${
              doctor.last_name || ""
            }`.trim(),
          ])
        );

        // ============================================================
        // 7. BUILD REQUESTS
        // ============================================================

        setRequests(
          (requestRows || []).map((request) => {
            const clinic = clinics.get(
              String(request.id_clinic)
            );

            const doctorName = request.doctor_id
              ? doctors.get(
                  String(request.doctor_id)
                )
              : null;

            return {
              id: String(request.id),

              clinicId: String(request.id_clinic),

              clinicName:
                clinic?.clinic_name ||
                "Clinic request",

              procedure:
                request.procedure ||
                "Not specified",

              // ----------------------------------------------------
              // Dates
              // ----------------------------------------------------

              startDate:
                request.start_date || "",

              endDate:
                request.end_date || "",

              finalStartDate:
                request.final_start_date || null,

              finalEndDate:
               request.final_end_date || null,

              date: formatRequestDate(
                request.start_date,
                request.end_date
              ),

              // ----------------------------------------------------
              // Doctor
              // ----------------------------------------------------

              doctor:
                doctorName || "Not assigned",

              // ----------------------------------------------------
              // Location
              // ----------------------------------------------------

              location: [
                clinic?.address,
                clinic?.country,
              ]
                .filter(Boolean)
                .join(", "),

              // ----------------------------------------------------
              // PRICE
              // ----------------------------------------------------
              //
              // This now comes directly from Patient_request.price.
              //
              // If the clinic has not proposed a price yet,
              // price will be NULL.
              //

              price:
                request.price !== null &&
                request.price !== undefined
                  ? Number(request.price)
                  : null,

              status: "pending",

              accommodation: null,

              inquiryCompleted:
                request.inquiry_completed ??
                false,

              clinicDecision:
                request.clinic_decision ??
                false,

              patientDecision:
                request.patient_decision ??
                false,
            };
          })
        );
      } catch (loadError) {
        console.error(
          "Failed to load patient requests:",
          loadError
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "We could not load your requests right now."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  return (
    <section>
      {/* ============================================================
          HEADER
      ============================================================ */}

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          My Requests
        </h2>

        <Link
          href="/search"
          className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-opacity hover:opacity-90"
        >
          New Request
        </Link>
      </div>

      {/* ============================================================
          REQUESTS
      ============================================================ */}

      <div className="space-y-4">

        {loading && (
          <p className="text-muted-foreground">
            Loading your requests...
          </p>
        )}

        {!loading && error && (
          <p
            role="alert"
            className="text-destructive"
          >
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          requests.length === 0 && (
            <p className="text-muted-foreground">
              You have not made any requests yet.
            </p>
          )}

        {!loading &&
          !error &&
          requests.map((request) => (
            <BookingCard
              key={request.id}
              booking={request}
            />
          ))}

      </div>
    </section>
  );
}

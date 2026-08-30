import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";

async function getPatientId(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (profileError || !profile) return null;

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (patientError || !patient) return null;

  return patient.id;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());

    // --------------------------------------------------
    // 1. Get authenticated user
    // --------------------------------------------------

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. Read request body
    // --------------------------------------------------

    const body = await request.json();

    const requestId =
      typeof body.requestId === "string"
        ? body.requestId.trim()
        : "";

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required." },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Get patient ID
    // --------------------------------------------------

    const patientId = await getPatientId(
      supabase,
      user.id
    );

    if (!patientId) {
      return NextResponse.json(
        { error: "Your patient profile could not be found." },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. Get the patient request
    // --------------------------------------------------

    const { data: patientRequest, error: requestError } =
      await supabase
        .from("Patient_request")
        .select(
          "id, id_patient, clinic_decision, patient_decision"
        )
        .eq("id", requestId)
        .single();

    if (requestError || !patientRequest) {
      return NextResponse.json(
        { error: "Patient request not found." },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 5. Make sure this request belongs to this patient
    // --------------------------------------------------

    if (
      String(patientRequest.id_patient) !==
      String(patientId)
    ) {
      return NextResponse.json(
        {
          error:
            "You are not authorized to accept this request.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 6. Clinic must accept first
    // --------------------------------------------------

    if (!patientRequest.clinic_decision) {
      return NextResponse.json(
        {
          error:
            "The clinic must accept the request first.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 7. Prevent accepting twice
    // --------------------------------------------------

    if (patientRequest.patient_decision) {
      return NextResponse.json(
        {
          error:
            "You have already accepted this request.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 8. Accept the request
    // --------------------------------------------------

    const { data: updatedRequest, error: updateError } =
      await supabase
        .from("Patient_request")
        .update({
          patient_decision: true,
        })
        .eq("id", requestId)
        .eq("id_patient", patientId)
        .select(
          "id, clinic_decision, patient_decision, inquiry_completed"
        )
        .single();

    if (updateError || !updatedRequest) {
      console.error(
        "Failed to accept patient request:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "We could not accept this request. Please try again.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 9. Return updated request
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error(
      "Patient accept request API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while accepting the request.",
      },
      { status: 500 }
    );
  }
}
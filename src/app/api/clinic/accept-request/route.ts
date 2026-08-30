import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";

async function getClinic(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (profileError || !profile) {
    return null;
  }

  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (clinicError || !clinic) {
    return null;
  }

  return clinic;
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
    // 2. Get clinic belonging to this user
    // --------------------------------------------------

    const clinic = await getClinic(supabase, user.id);

    if (!clinic) {
      return NextResponse.json(
        { error: "Your clinic profile could not be found." },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 3. Read request body
    // --------------------------------------------------

    const body = await request.json();

    const requestId =
      typeof body.requestId === "string"
        ? body.requestId.trim()
        : "";

    if (!requestId) {
      return NextResponse.json(
        { error: "Patient request is required." },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. Find request belonging to this clinic
    // --------------------------------------------------

    const { data: patientRequest, error: requestError } =
      await supabase
        .from("Patient_request")
        .select(
          "id, id_clinic, inquiry_completed, clinic_decision"
        )
        .eq("id", requestId)
        .eq("id_clinic", clinic.id)
        .single();

    if (requestError || !patientRequest) {
      console.error(
        "Patient request not found:",
        requestError
      );

      return NextResponse.json(
        { error: "Patient request could not be found." },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 5. Make sure inquiry is completed
    // --------------------------------------------------

    if (!patientRequest.inquiry_completed) {
      return NextResponse.json(
        {
          error:
            "The inquiry must be completed before accepting the request.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 6. Check if already accepted
    // --------------------------------------------------

    if (patientRequest.clinic_decision) {
      return NextResponse.json(
        {
          error: "This request has already been accepted.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 7. Accept request
    // --------------------------------------------------

    const { data: updatedRequest, error: updateError } =
      await supabase
        .from("Patient_request")
        .update({
          clinic_decision: true,
        })
        .eq("id", requestId)
        .eq("id_clinic", clinic.id)
        .select(
          "id, clinic_decision, patient_decision"
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
            "We could not accept the request. Please try again.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 8. Success
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error(
      "Clinic accept request API error:",
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
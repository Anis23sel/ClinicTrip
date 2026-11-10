import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
    }

    const body = await request.json();
    const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";
    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required." }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Could not verify cancellation profile:", profileError);
      return NextResponse.json({ error: "We could not verify your account." }, { status: 500 });
    }
    if (!profile || (profile.role !== "patient" && profile.role !== "clinic")) {
      return NextResponse.json({ error: "Only patients and clinics can cancel a consultation." }, { status: 403 });
    }

    const { data: patientRequest, error: requestError } = await supabase
      .from("Patient_request")
      .select("id, id_patient, id_clinic, cancelled_at, clinictrip_paid_at")
      .eq("id", requestId)
      .maybeSingle();

    if (requestError) {
      console.error("Could not load consultation for cancellation:", requestError);
      return NextResponse.json({ error: "We could not verify this consultation." }, { status: 500 });
    }
    if (!patientRequest) {
      return NextResponse.json({ error: "Consultation not found." }, { status: 404 });
    }

    const { data: owner, error: ownerError } =
      profile.role === "patient"
        ? await supabase.from("patients").select("id").eq("profile_id", profile.id).maybeSingle()
        : await supabase.from("clinics").select("id").eq("profile_id", profile.id).maybeSingle();

    if (ownerError) {
      console.error("Could not verify consultation owner:", ownerError);
      return NextResponse.json({ error: "We could not verify your account." }, { status: 500 });
    }

    const ownsRequest = owner && (
      profile.role === "patient"
        ? String(patientRequest.id_patient) === String(owner.id)
        : String(patientRequest.id_clinic) === String(owner.id)
    );
    if (!ownsRequest) {
      return NextResponse.json({ error: "You are not authorized to cancel this consultation." }, { status: 403 });
    }

    if (patientRequest.cancelled_at) {
      return NextResponse.json({ error: "This consultation has already been cancelled." }, { status: 409 });
    }
    if (patientRequest.clinictrip_paid_at) {
      return NextResponse.json({ error: "This consultation can no longer be cancelled after payment." }, { status: 409 });
    }

    const { data: cancelledRequest, error: updateError } = await supabase
      .from("Patient_request")
      .update({
        cancelled_at: new Date().toISOString(),
        cancelled_by: profile.role,
      })
      .eq("id", requestId)
      .is("cancelled_at", null)
      .is("clinictrip_paid_at", null)
      .select("id, cancelled_at, cancelled_by")
      .maybeSingle();

    if (updateError) {
      console.error("Failed to cancel consultation:", updateError);
      return NextResponse.json({ error: "We could not cancel this consultation. Please try again." }, { status: 500 });
    }
    if (!cancelledRequest) {
      return NextResponse.json({ error: "This consultation has already been cancelled or paid." }, { status: 409 });
    }

    return NextResponse.json({ success: true, request: cancelledRequest });
  } catch (error) {
    console.error("Cancellation API failed:", error);
    return NextResponse.json({ error: "Something went wrong while cancelling this consultation." }, { status: 500 });
  }
}

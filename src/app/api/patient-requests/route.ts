import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";

async function getPatientId(supabase: ReturnType<typeof createClient>, userId: string) {
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
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to start a request." }, { status: 401 });
  }

  const body = await request.json();
  const clinicId = String(body.clinicId || "");
  if (!clinicId) return NextResponse.json({ error: "Clinic is required." }, { status: 400 });

  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select("id")
    .eq("id", clinicId)
    .single();
  if (clinicError || !clinic) return NextResponse.json({ error: "Clinic not found." }, { status: 404 });

  const patientId = await getPatientId(supabase, user.id);
  if (!patientId) {
    return NextResponse.json({ error: "Your patient profile could not be found." }, { status: 400 });
  }

  const startDate = typeof body.startDate === "string" && body.startDate ? body.startDate : null;
  const endDate = typeof body.endDate === "string" && body.endDate ? body.endDate : startDate;
  const { data: newRequest, error: requestError } = await supabase
    .from("Patient_request")
    .insert({ id_patient: patientId, id_clinic: clinicId, start_date: startDate, end_date: endDate })
    .select("id")
    .single();

  if (requestError || !newRequest) {
    console.error("Failed to create patient request:", requestError);
    return NextResponse.json({ error: "We could not create your request. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ id: newRequest.id });
}
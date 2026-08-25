import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";
import { createClient } from "@/app/utils/supabase/server";


async function getAuthenticatedUser(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function getUserName(user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>) {
  const metadata = user.user_metadata || {};
  return metadata.full_name || metadata.name || metadata.display_name || user.email?.split("@")[0] || "";
}

async function getClinic(supabase: ReturnType<typeof createClient>, clinicId: string) {
  const { data, error } = await supabase
    .from("clinics")
    .select("clinic_name, email, address")
    .eq("id", clinicId)
    .single();

  if (error || !data) return null;
  return data;
}

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

export async function GET(request: Request) {
  const supabase = createClient(await cookies());
  const user = await getAuthenticatedUser(supabase);

  if (!user?.email) {
    return NextResponse.json({ error: "You must be signed in to contact a clinic." }, { status: 401 });
  }

  const clinicId = new URL(request.url).searchParams.get("clinicId");
  const clinic = clinicId ? await getClinic(supabase, clinicId) : null;
  if (!clinic) {
    return NextResponse.json({ error: "Clinic not found." }, { status: 404 });
  }

  return NextResponse.json({
    name: getUserName(user),
    email: user.email,
    clinicName: clinic.clinic_name,
    clinicAddress: clinic.address || "",
  });
}

export async function POST(request: Request) {
  const supabase = createClient(await cookies());
  const user = await getAuthenticatedUser(supabase);

  if (!user?.email) {
    return NextResponse.json({ error: "You must be signed in to contact a clinic." }, { status: 401 });
  }

  const body = await request.json();
  const clinicId = String(body.clinicId || "");
  const clinic = await getClinic(supabase, clinicId);
  if (!clinic) return NextResponse.json({ error: "Clinic not found." }, { status: 404 });

  const patientId = await getPatientId(supabase, user.id);
  if (!patientId) {
    return NextResponse.json({ error: "Your patient profile could not be found." }, { status: 400 });
  }

  const patientName = getUserName(user).trim();
  if (!patientName) {
    return NextResponse.json({ error: "Your signed-in name is required before sending an inquiry." }, { status: 400 });
  }
  if (typeof body.surgery !== "string" || !body.surgery.trim()) {
    return NextResponse.json({ error: "Surgery is required." }, { status: 400 });
  }

  const startDate = typeof body.date === "string" && body.date ? body.date : null;
  const endDate = typeof body.endDate === "string" && body.endDate ? body.endDate : startDate;
  const requestId = typeof body.requestId === "string" ? body.requestId : "";
  const requestQuery = requestId
    ? supabase
      .from("Patient_request")
      .update({ start_date: startDate, end_date: endDate })
      .eq("id", requestId)
      .eq("id_patient", patientId)
      .eq("id_clinic", clinicId)
      .select("id")
      .single()
    : supabase
      .from("Patient_request")
      .insert({
        id_patient: patientId,
        id_clinic: clinicId,
        start_date: startDate,
        end_date: endDate,
      });
  const { data: savedRequest, error: requestError } = await requestQuery;
  if (requestId && (requestError || !savedRequest)) {
    return NextResponse.json({ error: "This patient request could not be found." }, { status: 404 });
  }
  if (requestError) {
    console.error("Failed to save patient request:", requestError);
    return NextResponse.json({ error: "We could not save your request. Please try again." }, { status: 500 });
  }

  const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

if (!gmailUser || !gmailAppPassword) {
  return NextResponse.json(
    { error: "Email delivery is not configured yet." },
    { status: 503 }
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailAppPassword,
  },
});

const message = [
  `New inquiry from ${patientName}`,
  `Patient email: ${user.email}`,
  `Clinic: ${clinic.clinic_name}`,
  `Clinic address: ${clinic.address || "Not specified"}`,
  `Surgery: ${body.surgery.trim()}`,
  `Preferred date: ${body.date || "Not specified"}`,
  `Additional details: ${body.details || "None"}`,
].join("\n");

try {
  await transporter.sendMail({
    from: `ClinicTrip <${gmailUser}>`,
    to: clinic.email,
    replyTo: user.email,
    subject: `New clinic inquiry from ${patientName}`,
    text: message,
  });
} catch (error) {
  console.error("Gmail delivery failed:", error);

  return NextResponse.json(
    { error: "Email delivery failed. Please try again." },
    { status: 502 }
  );
}

return NextResponse.json({ success: true });
}
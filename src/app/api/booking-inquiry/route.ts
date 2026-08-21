import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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
  const clinic = await getClinic(supabase, String(body.clinicId || ""));
  if (!clinic) return NextResponse.json({ error: "Clinic not found." }, { status: 404 });

  const patientName = getUserName(user).trim();
  if (!patientName) {
    return NextResponse.json({ error: "Your signed-in name is required before sending an inquiry." }, { status: 400 });
  }
  if (typeof body.surgery !== "string" || !body.surgery.trim()) {
    return NextResponse.json({ error: "Surgery is required." }, { status: 400 });
  }
  if (typeof clinic.email !== "string" || !clinic.email.trim()) {
    return NextResponse.json({ error: "This clinic does not have a registered email address." }, { status: 503 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Email delivery is not configured yet." }, { status: 503 });

  const message = [
    `New inquiry from ${patientName}`,
    `Patient email: ${user.email}`,
    `Clinic: ${clinic.clinic_name}`,
    `Clinic address: ${clinic.address || "Not specified"}`,
    `Surgery: ${body.surgery.trim()}`,
    `Preferred date: ${body.date || "Not specified"}`,
    `Additional details: ${body.details || "None"}`,
  ].join("\n");

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "Clinic Trip <no-reply@clinictrip.com>",
      to: [clinic.email.trim()],
      subject: `New clinic inquiry from ${patientName}`,
      text: message,
    }),
  });

  if (!emailResponse.ok) return NextResponse.json({ error: "Email delivery failed. Please try again." }, { status: 502 });
  return NextResponse.json({ success: true });
}
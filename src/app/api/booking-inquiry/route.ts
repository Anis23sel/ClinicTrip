import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";

const clinics: Record<string, { name: string; email: string }> = {
  "1": { name: "Istanbul Medical Center", email: "info@istanbulmedical.com" },
};

export async function POST(request: Request) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "You must be signed in to contact a clinic." }, { status: 401 });
  }

  const body = await request.json();
  const clinic = clinics[String(body.clinicId)];
  if (!clinic) return NextResponse.json({ error: "Clinic not found." }, { status: 404 });
  if (typeof body.name !== "string" || typeof body.surgery !== "string" || !body.name.trim() || !body.surgery.trim()) {
    return NextResponse.json({ error: "Name and surgery are required." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Email delivery is not configured yet." }, { status: 503 });

  const message = [
    `New inquiry from ${body.name.trim()}`,
    `Patient email: ${user.email}`,
    `Surgery: ${body.surgery.trim()}`,
    `Preferred date: ${body.date || "Not specified"}`,
    `Additional details: ${body.details || "None"}`,
  ].join("\n");

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "Clinic Trip <no-reply@clinictrip.com>",
      to: [clinic.email],
      reply_to: user.email,
      subject: `New clinic inquiry from ${body.name.trim()}`,
      text: message,
    }),
  });

  if (!emailResponse.ok) return NextResponse.json({ error: "Email delivery failed. Please try again." }, { status: 502 });
  return NextResponse.json({ success: true });
}
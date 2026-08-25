import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";
import { createClient } from "@/app/utils/supabase/server";

async function getAuthenticatedUser(
  supabase: ReturnType<typeof createClient>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

async function getClinic(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (profileError || !profile) return null;

  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select("clinic_name, email")
    .eq("profile_id", profile.id)
    .single();

  if (clinicError || !clinic) return null;

  return clinic;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());

    const user = await getAuthenticatedUser(supabase);

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const clinic = await getClinic(supabase, user.id);

    if (!clinic) {
      return NextResponse.json(
        { error: "Your clinic profile could not be found." },
        { status: 404 }
      );
    }

    if (!clinic.email) {
      return NextResponse.json(
        { error: "Your clinic does not have an email address." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const patientEmail =
      typeof body.patientEmail === "string"
        ? body.patientEmail.trim()
        : "";

    const subject =
      typeof body.subject === "string"
        ? body.subject.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!patientEmail) {
      return NextResponse.json(
        { error: "Patient email is required." },
        { status: 400 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { error: "Subject is required." },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
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

    await transporter.sendMail({
      from: `ClinicTrip <${gmailUser}>`,
      to: patientEmail,
      replyTo: clinic.email,
      subject,
      text: [
        `Message from ${clinic.clinic_name}`,
        "",
        message,
        "",
        `Clinic email: ${clinic.email}`,
      ].join("\n"),
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Clinic email delivery failed:", error);

    return NextResponse.json(
      {
        error: "Email delivery failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
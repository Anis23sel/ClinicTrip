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
    .select("id, clinic_name, email")
    .eq("profile_id", profile.id)
    .single();

  if (clinicError || !clinic) return null;

  return clinic;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());

    // --------------------------------------------------
    // 1. Authenticate clinic
    // --------------------------------------------------

    const user = await getAuthenticatedUser(supabase);

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. Get clinic
    // --------------------------------------------------

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

    // --------------------------------------------------
    // 3. Read body
    // --------------------------------------------------

    const body = await request.json();

    const requestId =
      typeof body.requestId === "string"
        ? body.requestId.trim()
        : "";

    const subject =
      typeof body.subject === "string"
        ? body.subject.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    // --------------------------------------------------
    // 4. Validate
    // --------------------------------------------------

    if (!requestId) {
      return NextResponse.json(
        { error: "Patient request is required." },
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

    // --------------------------------------------------
    // 5. Find request belonging to this clinic
    // --------------------------------------------------

    const { data: patientRequest, error: requestError } =
      await supabase
        .from("Patient_request")
        .select("id, id_patient, id_clinic")
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
    // 6. Get patient email
    // --------------------------------------------------

    const { data: patient, error: patientError } =
      await supabase
        .from("patients")
        .select("email")
        .eq("id", patientRequest.id_patient)
        .single();

    if (patientError || !patient) {
      console.error(
        "Patient not found:",
        patientError
      );

      return NextResponse.json(
        { error: "Patient could not be found." },
        { status: 404 }
      );
    }

    const patientEmail = patient.email?.trim();

    if (!patientEmail) {
      return NextResponse.json(
        { error: "This patient does not have an email address." },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 7. Email configuration
    // --------------------------------------------------

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword =
      process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
      return NextResponse.json(
        { error: "Email delivery is not configured yet." },
        { status: 503 }
      );
    }

    // --------------------------------------------------
    // 8. Create transporter
    // --------------------------------------------------

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // --------------------------------------------------
    // 9. Send email
    // --------------------------------------------------

    console.log("ABOUT TO SEND CLINIC EMAIL");
    console.log("Patient email:", patientEmail);
    console.log("Clinic:", clinic.clinic_name);
    console.log("Request ID:", requestId);

    await transporter.sendMail({
      from: `ClinicTrip <${gmailUser}>`,
      to: patientEmail,
      subject,
      text: [
        `Message from ${clinic.clinic_name}`,
        "",
        message,
        "",
        "Please reply through ClinicTrip to continue the conversation.",
      ].join("\n"),
    });

    console.log("CLINIC EMAIL SENT SUCCESSFULLY");

    // --------------------------------------------------
    // 10. Success
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Clinic email delivery failed:",
      error
    );

    return NextResponse.json(
      {
        error: "Email delivery failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
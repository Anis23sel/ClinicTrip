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

function getUserName(
  user: NonNullable<
    Awaited<ReturnType<typeof getAuthenticatedUser>>
  >
) {
  const metadata = user.user_metadata || {};

  return (
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    user.email?.split("@")[0] ||
    ""
  );
}

async function getClinic(
  supabase: ReturnType<typeof createClient>,
  clinicId: string
) {
  const { data, error } = await supabase
    .from("clinics")
    .select("clinic_name, email, address")
    .eq("id", clinicId)
    .single();

  if (error || !data) return null;

  return data;
}

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

export async function GET(request: Request) {
  const supabase = createClient(await cookies());

  const user = await getAuthenticatedUser(supabase);

  if (!user) {
    return NextResponse.json(
      {
        error: "You must be signed in to contact a clinic.",
      },
      { status: 401 }
    );
  }

  const clinicId = new URL(request.url).searchParams.get(
    "clinicId"
  );

  if (!clinicId) {
    return NextResponse.json(
      {
        error: "Clinic is required.",
      },
      { status: 400 }
    );
  }

  const clinic = await getClinic(supabase, clinicId);

  if (!clinic) {
    return NextResponse.json(
      {
        error: "Clinic not found.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    name: getUserName(user),
    clinicName: clinic.clinic_name,
    clinicAddress: clinic.address || "",
  });
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());

    // --------------------------------------------------
    // 1. Authenticate patient
    // --------------------------------------------------

    const user = await getAuthenticatedUser(supabase);

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be signed in to send an inquiry.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. Read body
    // --------------------------------------------------

    const body = await request.json();

    const clinicId =
      typeof body.clinicId === "string"
        ? body.clinicId.trim()
        : "";

    const requestId =
      typeof body.requestId === "string"
        ? body.requestId.trim()
        : "";

    const procedure =
      typeof body.procedure === "string"
        ? body.procedure.trim()
        : "";

    const startDate =
      typeof body.startDate === "string" &&
      body.startDate.trim()
        ? body.startDate.trim()
        : null;

    const endDate =
      typeof body.endDate === "string" &&
      body.endDate.trim()
        ? body.endDate.trim()
        : null;

    const details =
      typeof body.details === "string"
        ? body.details.trim()
        : "";

    // --------------------------------------------------
    // 3. Validate
    // --------------------------------------------------

    if (!clinicId) {
      return NextResponse.json(
        { error: "Clinic is required." },
        { status: 400 }
      );
    }

    if (!requestId) {
      return NextResponse.json(
        { error: "Patient request is required." },
        { status: 400 }
      );
    }

    if (!procedure) {
      return NextResponse.json(
        { error: "Procedure is required." },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { error: "Start date is required." },
        { status: 400 }
      );
    }

    if (!endDate) {
      return NextResponse.json(
        { error: "End date is required." },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. Get patient
    // --------------------------------------------------

    const patientId = await getPatientId(
      supabase,
      user.id
    );

    if (!patientId) {
      return NextResponse.json(
        {
          error:
            "Your patient profile could not be found.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 5. Get clinic
    // --------------------------------------------------

    const clinic = await getClinic(
      supabase,
      clinicId
    );

    if (!clinic) {
      return NextResponse.json(
        {
          error: "Clinic not found.",
        },
        { status: 404 }
      );
    }

    if (!clinic.email) {
      return NextResponse.json(
        {
          error:
            "This clinic does not have an email address configured.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 6. Find the EXISTING patient request
    // --------------------------------------------------

    const { data: existingRequest, error: requestError } =
      await supabase
        .from("Patient_request")
        .select(
          "id, id_patient, id_clinic, procedure, start_date, end_date, inquiry_completed"
        )
        .eq("id", requestId)
        .eq("id_patient", patientId)
        .eq("id_clinic", clinicId)
        .single();

      console.log("EXISTING REQUEST:", existingRequest);

    if (requestError || !existingRequest) {
      console.error(
        "Patient request not found:",
        requestError
      );

      return NextResponse.json(
        {
          error:
            "This patient request could not be found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 7. Don't send the inquiry twice
    // --------------------------------------------------
   

    if (existingRequest.inquiry_completed) {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
      });
    }

    // --------------------------------------------------
    // 8. Get patient name
    // --------------------------------------------------

    const patientName = getUserName(user).trim();

    if (!patientName) {
      return NextResponse.json(
        {
          error:
            "Your name is required before sending an inquiry.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 9. Email configuration
    // --------------------------------------------------

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword =
      process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
      return NextResponse.json(
        {
          error:
            "Email delivery is not configured yet.",
        },
        { status: 503 }
      );
    }

    // --------------------------------------------------
    // 10. Create transporter
    // --------------------------------------------------

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // --------------------------------------------------
    // 11. Email sent to clinic
    // --------------------------------------------------

    const message = [
      `New inquiry from ${patientName}`,
      "",
      `Procedure: ${existingRequest.procedure}`,
      `Start date: ${existingRequest.start_date}`,
      `End date: ${existingRequest.end_date}`,
      "",
      `Additional details: ${
        details || "None provided"
      }`,
      "",
      "Please respond through ClinicTrip.",
    ].join("\n");

    // IMPORTANT:
    // We deliberately DO NOT include:
    // - patient's email
    // - clinic's email
    // - replyTo: patient's email

    console.log("ABOUT TO SEND EMAIL");
    console.log("Clinic email:", clinic.email);
    console.log("Gmail user:", gmailUser);
    console.log("Request ID:", requestId);
    console.log("Procedure:", existingRequest.procedure);
    console.log("Start:", existingRequest.start_date);
    console.log("End:", existingRequest.end_date);

    try {
      await transporter.sendMail({
        from: `ClinicTrip <${gmailUser}>`,
        to: clinic.email,
        subject: `New inquiry from ${patientName}`,
        text: message,
      });
    } catch (emailError) {
      console.error(
        "Gmail delivery failed:",
        emailError
      );

      return NextResponse.json(
        {
          error:
            "Email delivery failed. Please try again.",
        },
        { status: 502 }
      );
    }

    // --------------------------------------------------
    // 12. Mark inquiry as completed
    // --------------------------------------------------

    const { error: updateError } = await supabase
      .from("Patient_request")
      .update({
        inquiry_completed: true,

        // Keep the request information synchronized
        // with what the patient submitted.
        procedure: procedure,
        start_date: startDate,
        end_date: endDate,
      })
      .eq("id", requestId)
      .eq("id_patient", patientId)
      .eq("id_clinic", clinicId);

    if (updateError) {
      console.error(
        "Failed to mark inquiry as completed:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "The inquiry was sent, but we could not update its status.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 13. Success
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Booking inquiry API failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while sending the inquiry.",
      },
      { status: 500 }
    );
  }
}
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

  if (profileError || !profile) {
    return null;
  }

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (patientError || !patient) {
    return null;
  }

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
        {
          error: "You must be signed in to start a request.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. Read request body
    // --------------------------------------------------

    const body = await request.json();

    const clinicId =
      typeof body.clinicId === "string"
        ? body.clinicId.trim()
        : "";

    /*
     * The ClinicPage now sends:
     *
     * procedures: ["Rhinoplasty", "Liposuction"]
     *
     * We support both the new array format and the old
     * single-string format for compatibility.
     */
    let procedures: string[] = [];

    if (Array.isArray(body.procedures)) {
      procedures = body.procedures
        .filter(
          (procedure: unknown): procedure is string =>
            typeof procedure === "string"
        )
        .map((procedure: string) => procedure.trim())
        .filter(Boolean);
    } else if (typeof body.procedure === "string") {
      const procedure = body.procedure.trim();

      if (procedure) {
        procedures = [procedure];
      }
    }

    /*
     * Doctor is optional.
     */
    const doctorId =
      typeof body.doctorId === "string" && body.doctorId.trim()
        ? body.doctorId.trim()
        : null;

    /*
     * Dates are optional.
     */
    const startDate =
      typeof body.startDate === "string" &&
      body.startDate.trim()
        ? body.startDate.trim()
        : null;

    const endDate =
      typeof body.endDate === "string" &&
      body.endDate.trim()
        ? body.endDate.trim()
        : startDate;

    console.log("PATIENT REQUEST:");
    console.log("clinicId:", clinicId);
    console.log("procedures:", procedures);
    console.log("doctorId:", doctorId);
    console.log("startDate:", startDate);
    console.log("endDate:", endDate);

    // --------------------------------------------------
    // 3. Validate required fields
    // --------------------------------------------------

    if (!clinicId) {
      return NextResponse.json(
        {
          error: "Clinic is required.",
        },
        { status: 400 }
      );
    }

    if (procedures.length === 0) {
      return NextResponse.json(
        {
          error: "Please select at least one procedure.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. Check clinic exists
    // --------------------------------------------------

    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("id")
      .eq("id", clinicId)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json(
        {
          error: "Clinic not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 5. Get patient ID
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
    // 6. Create Patient_request
    // --------------------------------------------------

    /*
     * Your current database has ONE "procedure" column.
     *
     * Therefore, multiple selected procedures are stored
     * as a comma-separated string:
     *
     * "Rhinoplasty, Liposuction"
     *
     * If you later create a separate patient_request_procedures
     * table, we can normalize this properly.
     */
    const procedureValue = procedures.join(", ");

    const insertData: {
      id_patient: string;
      id_clinic: string;
      procedure: string;
      start_date: string | null;
      end_date: string | null;
      doctor_id?: string | null;
    } = {
      id_patient: patientId,
      id_clinic: clinicId,
      procedure: procedureValue,
      start_date: startDate,
      end_date: endDate,
    };

    /*
     * Only include doctor_id if your Patient_request table
     * actually has this column.
     *
     * If your table does NOT have doctor_id, remove the
     * following two lines.
     */
    if (doctorId) {
      insertData.doctor_id = doctorId;
    }

    const { data: newRequest, error: requestError } =
      await supabase
        .from("Patient_request")
        .insert(insertData)
        .select("id")
        .single();

    if (requestError || !newRequest) {
      console.error(
        "Failed to create patient request:",
        requestError
      );

      return NextResponse.json(
        {
          error:
            requestError?.message ||
            "We could not create your request. Please try again.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 7. Return created request
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      id: newRequest.id,
    });
  } catch (error) {
    console.error(
      "Patient request API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating your request.",
      },
      { status: 500 }
    );
  }
}

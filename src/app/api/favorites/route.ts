import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const privateJson = (body: unknown, status = 200) => NextResponse.json(body, {
  status,
  headers: { "Cache-Control": "private, no-store, max-age=0" },
});

async function getPatientContext() {
  const supabase = createClient(await cookies());
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { response: privateJson({ error: "Please sign in to manage favorites." }, 401) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError) {
    console.error("Favorite API could not load the user profile:", profileError);
    return { response: privateJson({ error: "We couldn't verify this account." }, 500) };
  }
  if (!profile || profile.role !== "patient") {
    return { response: privateJson({ error: "A patient account is required." }, 403) };
  }

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (patientError) {
    console.error("Favorite API could not load the patient record:", patientError);
    return { response: privateJson({ error: "We couldn't verify this patient account." }, 500) };
  }
  if (!patient) {
    return { response: privateJson({ error: "No patient profile is linked to this account." }, 403) };
  }

  return { supabase, patientId: String(patient.id) };
}

export async function GET(request: Request) {
  const context = await getPatientContext();
  if ("response" in context) return context.response;

  const { data: favorites, error } = await context.supabase
    .from("favorites")
    .select("clinic_id, created_at")
    .eq("patient_id", context.patientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Favorite API could not load favorites:", error);
    return privateJson({ error: "We couldn't load your saved clinics." }, 500);
  }

  const favoriteClinicIds = (favorites || []).map((favorite) => String(favorite.clinic_id));
  const url = new URL(request.url);
  if (url.searchParams.get("details") !== "true" || favoriteClinicIds.length === 0) {
    return privateJson({ favoriteClinicIds });
  }

  const [clinicsResult, imagesResult, reviewsResult] = await Promise.all([
    context.supabase.from("clinics").select("id, clinic_name, country, city_id").in("id", favoriteClinicIds),
    context.supabase.from("clinic_images").select("clinic_id, storage_path, display_order").in("clinic_id", favoriteClinicIds).order("display_order", { ascending: true }),
    context.supabase.from("reviews").select("clinic_id, rating").in("clinic_id", favoriteClinicIds),
  ]);

  const queryError = clinicsResult.error || imagesResult.error || reviewsResult.error;
  if (queryError) {
    console.error("Favorite API could not load clinic details:", queryError);
    return privateJson({ error: "We couldn't load your saved clinic details." }, 500);
  }

  const clinics = clinicsResult.data || [];
  const cityIds = [...new Set(clinics.map((clinic) => clinic.city_id).filter((id): id is string => Boolean(id)))];
  const citiesResult = cityIds.length
    ? await context.supabase.from("cities").select("id, city").in("id", cityIds)
    : { data: [], error: null };
  if (citiesResult.error) {
    console.error("Favorite API could not load clinic cities:", citiesResult.error);
    return privateJson({ error: "We couldn't load your saved clinic locations." }, 500);
  }

  const cityById = new Map((citiesResult.data || []).map((city) => [String(city.id), city.city]));
  const imageByClinic = new Map<string, string>();
  for (const image of imagesResult.data || []) {
    const clinicId = String(image.clinic_id);
    if (!imageByClinic.has(clinicId)) {
      imageByClinic.set(clinicId, context.supabase.storage.from("clinic-images").getPublicUrl(image.storage_path).data.publicUrl);
    }
  }
  const ratingsByClinic = new Map<string, number[]>();
  for (const review of reviewsResult.data || []) {
    const clinicId = String(review.clinic_id);
    ratingsByClinic.set(clinicId, [...(ratingsByClinic.get(clinicId) || []), Number(review.rating)]);
  }

  const savedClinics = clinics.map((clinic) => {
    const ratings = ratingsByClinic.get(String(clinic.id)) || [];
    return {
      id: String(clinic.id),
      name: clinic.clinic_name,
      city: clinic.city_id ? cityById.get(String(clinic.city_id)) || "" : "",
      country: clinic.country || "",
      image: imageByClinic.get(String(clinic.id)) || null,
      rating: ratings.length ? Number((ratings.reduce((total, rating) => total + rating, 0) / ratings.length).toFixed(1)) : null,
      reviewCount: ratings.length,
    };
  });

  return privateJson({ favoriteClinicIds, clinics: savedClinics });
}

export async function POST(request: Request) {
  const context = await getPatientContext();
  if ("response" in context) return context.response;

  let body: { clinicId?: unknown };
  try {
    body = await request.json();
  } catch {
    return privateJson({ error: "A valid clinic ID is required." }, 400);
  }

  const clinicId = typeof body.clinicId === "string" ? body.clinicId.trim() : "";
  if (!UUID_PATTERN.test(clinicId)) {
    return privateJson({ error: "A valid clinic ID is required." }, 400);
  }

  const { data: clinic, error: clinicError } = await context.supabase
    .from("clinics")
    .select("id")
    .eq("id", clinicId)
    .maybeSingle();
  if (clinicError) {
    console.error("Favorite API could not verify the clinic:", clinicError);
    return privateJson({ error: "We couldn't verify this clinic." }, 500);
  }
  if (!clinic) return privateJson({ error: "Clinic not found." }, 404);

  const { error } = await context.supabase
    .from("favorites")
    .insert({ patient_id: context.patientId, clinic_id: clinicId });

  if (error && error.code !== "23505") {
    console.error("Favorite API could not save a clinic:", error);
    return privateJson({ error: "We couldn't save this clinic." }, 500);
  }

  return privateJson({ success: true, isFavorite: true });
}

export async function DELETE(request: Request) {
  const context = await getPatientContext();
  if ("response" in context) return context.response;

  let body: { clinicId?: unknown };
  try {
    body = await request.json();
  } catch {
    return privateJson({ error: "A valid clinic ID is required." }, 400);
  }

  const clinicId = typeof body.clinicId === "string" ? body.clinicId.trim() : "";
  if (!UUID_PATTERN.test(clinicId)) {
    return privateJson({ error: "A valid clinic ID is required." }, 400);
  }

  const { error } = await context.supabase
    .from("favorites")
    .delete()
    .eq("patient_id", context.patientId)
    .eq("clinic_id", clinicId);

  if (error) {
    console.error("Favorite API could not remove a clinic:", error);
    return privateJson({ error: "We couldn't remove this clinic." }, 500);
  }

  return privateJson({ success: true, isFavorite: false });
}

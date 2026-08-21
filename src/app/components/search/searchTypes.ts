export interface Surgery {
  name: string;
  price: number;
  category: string;
  group: string;
}

export interface DoctorResult {
  id: string | number;
  name: string;
  speciality: string;
  procedures: string[];
}

export interface ClinicResult {
  id: string | number;
  name: string;
  city: string;
  country: string;
  rating: number | null;
  procedures: string[];
  doctors: DoctorResult[];
  startingPrice: number;
}

export interface DatabaseClinic {
  id: string | number;
  clinic_name: string;
  country: string | null;
  city_id: string | number | null;
}

export interface DatabaseCity {
  id: string | number;
  city: string;
}

export interface DatabaseProcedure {
  id: string | number;
  name: string;
  category_id: string | number | null;
}

export interface DatabaseCategory {
  id: string | number;
  name: string;
  domain_id: string | number | null;
}

export interface DatabaseDomain {
  id: string | number;
  name: string;
}

export interface DatabaseDoctor {
  id: string | number;
  first_name: string | null;
  last_name: string | null;
  speciality_id: string | number | null;
  clinic_id: string | number;
}

export interface DatabaseSpeciality {
  id: string | number;
  name: string;
}

export interface DatabaseDoctorProcedure {
  doctor_id: string | number;
  procedure_id: string | number;
}

export interface DatabaseClinicProcedure {
  clinic_id: string | number;
  procedure_id: string | number;
  starting_price: number | string | null;
}

export interface DateRange {
  from: string;
  to: string;
}

export function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getProcedureCategory(procedure: string) {
  const normalized = normalizeText(procedure);
  if (normalized.includes("dental") || normalized.includes("teeth") || normalized.includes("implant") || normalized.includes("veneer") || normalized.includes("crown") || normalized.includes("bridge") || normalized.includes("invisalign") || normalized.includes("canal")) {
    return "dental";
  }
  if (normalized.includes("hair") || normalized.includes("transplant")) {
    return "hair-transplant";
  }
  return "plastic-surgery";
}

export function getBodyPartProcedures(part: string | null) {
  if (!part) return [];

  const map: Record<string, string[]> = {
    face: ["Rhinoplasty", "Facelift", "Eyelid Surgery", "Neck Lift"],
    nose: ["Rhinoplasty"],
    teeth: ["Dental Implants", "Veneers", "Teeth Whitening", "Dental Crowns", "Full Mouth Reconstruction", "Dental Bridges", "Invisalign", "Root Canal"],
    chest: ["Breast Augmentation", "Breast Reduction", "Breast Lift"],
    abdomen: ["Tummy Tuck", "Liposuction", "Mommy Makeover"],
    arms: ["Arm Lift"],
    legs: ["Thigh Lift"],
  };

  return map[part] ?? [];
}

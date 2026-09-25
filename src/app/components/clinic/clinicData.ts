export interface ClinicProcedure {
  id: string | number;
  procedureId: string | number;
  name: string;
  description: string;
  category: string;
  startingPrice: number;
}

export interface ClinicData {
  id: string | number;
  name: string;
  city?: string;
  country?: string;
  rating?: number;
  reviewCount?: number;
  procedures: ClinicProcedure[];
}

export interface ReviewData {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  user_name?: string;
}

type DatabaseProcedure = {
  id?: string | number;
  name?: string;
  procedure_name?: string;
  title?: string;
  description?: string;
  category?: string;
};

type DatabaseClinicProcedure = {
  id: string | number;
  procedure_id: string | number;
  starting_price: number | string;
  medical_prodedure?: DatabaseProcedure | DatabaseProcedure[] | null;
};

type DatabaseReview = {
  rating: number;
};

export function mapClinicData(row: {
  id: string | number;
  clinic_name: string;
  clinic_procedures?: DatabaseClinicProcedure[] | null;
  reviews?: DatabaseReview[] | null;
}): ClinicData {
  const reviews = row.reviews || [];
  const reviewCount = reviews.length;
  
  let rating: number | undefined = undefined;
  if (reviewCount > 0) {
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    rating = Number((sum / reviewCount).toFixed(1)); // ex: 4.5
  }
  return {
    id: row.id,
    name: row.clinic_name,
    rating: rating,
    reviewCount: reviewCount,
    procedures: (row.clinic_procedures || []).map((clinicProcedure) => {
      const procedure = Array.isArray(clinicProcedure.medical_prodedure)
        ? clinicProcedure.medical_prodedure[0]
        : clinicProcedure.medical_prodedure;

      return {
        id: clinicProcedure.id,
        procedureId: clinicProcedure.procedure_id,
        name: procedure?.name || procedure?.procedure_name || procedure?.title || "Procedure",
        description: procedure?.description || "",
        category: procedure?.category || "",
        startingPrice: Number(clinicProcedure.starting_price),
      };
    }),
  };
}

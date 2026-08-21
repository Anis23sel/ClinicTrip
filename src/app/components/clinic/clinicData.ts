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
  procedures: ClinicProcedure[];
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

export function mapClinicData(row: {
  id: string | number;
  clinic_name: string;
  clinic_procedures?: DatabaseClinicProcedure[] | null;
}): ClinicData {
  return {
    id: row.id,
    name: row.clinic_name,
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

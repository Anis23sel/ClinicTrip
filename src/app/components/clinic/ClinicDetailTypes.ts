export interface ClinicProcedure {
  id: string | number;
  procedureId: string | number;
  name: string;
  description: string;
  category: string;
  duration: string;
  startingPrice: number;
  genderScope: string;
}

export interface ClinicDetailData {
  id: string | number;
  name: string;
  address: string;
  phone: string;
  state: string;
  website: string;
  country: string;
  city: string;
  procedures: ClinicProcedure[];
}

type ProcedureRow = {
  id: string | number;
  name: string;
  description: string | null;
  duration_minutes: number | null;
  category_id: string | number | null;
  gender_scope_id: string | number | null;
};

type CategoryRow = { id: string | number; name: string; domain_id: string | number | null };
type DomainRow = { id: string | number; name: string };
type GenderScopeRow = { id: string | number; name: string };

export function mapClinicDetailData(
  clinic: { id: string | number; clinic_name: string; address: string | null; phone: string | null; state: string | null; website: string | null; country: string | null; city: string | null },
  clinicProcedures: { id: string | number; procedure_id: string | number; starting_price: number | string }[],
  procedures: ProcedureRow[],
  categories: CategoryRow[],
  domains: DomainRow[],
  genderScopes: GenderScopeRow[],
): ClinicDetailData {
  const procedureById = new Map(procedures.map((procedure) => [String(procedure.id), procedure]));
  const categoryById = new Map(categories.map((category) => [String(category.id), category]));
  const domainById = new Map(domains.map((domain) => [String(domain.id), domain]));
  const genderScopeById = new Map(genderScopes.map((scope) => [String(scope.id), scope]));

  return {
    id: clinic.id,
    name: clinic.clinic_name,
    address: clinic.address || "",
    phone: clinic.phone || "",
    state: clinic.state || "",
    website: clinic.website || "",
    country: clinic.country || "",
    city: clinic.city || "",
    procedures: clinicProcedures.flatMap((clinicProcedure) => {
      const procedure = procedureById.get(String(clinicProcedure.procedure_id));
      if (!procedure) return [];

      const category = procedure.category_id === null ? undefined : categoryById.get(String(procedure.category_id));
      const domain = category?.domain_id === null || category?.domain_id === undefined ? undefined : domainById.get(String(category.domain_id));
      const genderScope = procedure.gender_scope_id === null ? undefined : genderScopeById.get(String(procedure.gender_scope_id));

      return [{
        id: clinicProcedure.id,
        procedureId: clinicProcedure.procedure_id,
        name: procedure.name,
        description: procedure.description || "",
        category: domain ? `${domain.name} / ${category?.name || ""}` : category?.name || "",
        duration: procedure.duration_minutes ? `${procedure.duration_minutes} minutes` : "",
        startingPrice: Number(clinicProcedure.starting_price),
        genderScope: genderScope?.name || "",
      }];
    }),
  };
}

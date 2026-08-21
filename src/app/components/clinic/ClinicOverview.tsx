import type { ClinicData } from "./clinicData";

export default function ClinicOverview({ clinic }: { clinic: ClinicData }) {
  return (
    <section>
      <h3 className="mb-3 text-xl font-semibold">Available Procedures</h3>
      {clinic.procedures.length === 0 ? (
        <p className="text-muted-foreground">No procedures are available for this clinic yet.</p>
      ) : (
        <div className="space-y-4">
          {clinic.procedures.map((procedure) => (
            <article key={procedure.id} className="rounded-xl border border-border p-4">
              <h4 className="mb-1 font-semibold">{procedure.name}</h4>
              {procedure.category && <p className="text-sm text-primary">{procedure.category}</p>}
              {procedure.description && <p className="mb-3 text-sm text-muted-foreground">{procedure.description}</p>}
              <div className="text-sm text-muted-foreground">Starting price</div>
              <div className="text-2xl font-bold text-primary">${procedure.startingPrice.toLocaleString()}</div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

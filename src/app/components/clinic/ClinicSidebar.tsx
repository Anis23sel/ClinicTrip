interface ClinicSidebarProps { onContact: () => void; }

export default function ClinicSidebar({ onContact }: ClinicSidebarProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border-2 border-primary bg-primary/10 p-6">
        <button onClick={onContact} className="mt-5 inline-block w-full rounded-lg bg-primary px-6 py-3 text-center font-semibold text-primary-foreground transition-opacity hover:opacity-90">Contact the clinic and start now</button>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 font-semibold">Clinic Information</h3>
        <p className="text-sm text-muted-foreground">Contact the clinic to discuss your procedure and next steps.</p>
      </div>
    </div>
  );
}
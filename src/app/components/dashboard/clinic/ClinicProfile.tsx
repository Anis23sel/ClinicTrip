export default function ClinicProfile() {
  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold">Clinic Profile</h2>
      <div className="rounded-lg border border-border bg-card p-6">
        <form className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Clinic Name" defaultValue="Istanbul Medical Center" />
            <Field label="Email" type="email" defaultValue="info@istanbulmedical.com" />
            <Field label="Phone" type="tel" defaultValue="+90 212 555 0123" />
            <label className="block font-medium">Country<select className="mt-2 w-full rounded-lg border border-border bg-input-background px-4 py-3"><option>Turkey</option><option>Thailand</option><option>Mexico</option></select></label>
            <Field label="City" defaultValue="Istanbul" />
          </div>
          <Field label="Address" defaultValue="Nisantasi Mahallesi, Tesvikiye Caddesi No: 123, Sisli" />
          <label className="block font-medium">Description<textarea rows={4} defaultValue="Leading medical facility with over 15 years of experience in medical tourism..." className="mt-2 w-full rounded-lg border border-border bg-input-background px-4 py-3" /></label>
          <div><p className="mb-2 font-medium">Specializations</p><div className="mb-3 flex flex-wrap gap-2">{['Plastic Surgery', 'Hair Transplant', 'Dental Care'].map((specialization) => <span key={specialization} className="rounded-lg bg-primary/10 px-3 py-1 text-primary">{specialization}</span>)}</div><button type="button" className="text-sm text-primary hover:underline">+ Add specialization</button></div>
          <button type="submit" className="rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90">Save Changes</button>
        </form>
      </div>
    </section>
  );
}

function Field({ label, type = 'text', defaultValue }: { label: string; type?: string; defaultValue: string }) {
  return <label className="block font-medium">{label}<input type={type} defaultValue={defaultValue} className="mt-2 w-full rounded-lg border border-border bg-input-background px-4 py-3" /></label>;
}
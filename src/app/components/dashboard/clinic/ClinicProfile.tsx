import { useState } from 'react';
import type { ClinicRecord } from '../../../dashboard/clinic/page';

export default function ClinicProfile({ clinic, onSave }: { clinic: ClinicRecord; onSave: (clinic: ClinicRecord) => Promise<void> }) {
  const [draft, setDraft] = useState(clinic);
  const [message, setMessage] = useState('');
  const update = (key: keyof ClinicRecord, value: string) => setDraft({ ...draft, [key]: value });
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try { await onSave(draft); setMessage('Profile saved successfully.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save clinic profile.'); }
  };

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold">Clinic Profile</h2>
      <div className="rounded-lg border border-border bg-card p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Clinic Name" value={draft.clinic_name} onChange={(value) => update('clinic_name', value)} />
            <Field label="Email" type="email" value={draft.email || ''} onChange={(value) => update('email', value)} />
            <Field label="Phone" type="tel" value={draft.phone || ''} onChange={(value) => update('phone', value)} />
            <Field label="Country" value={draft.country || ''} onChange={(value) => update('country', value)} />
            
          </div>
          <Field label="Address" value={draft.address || ''} onChange={(value) => update('address', value)} />
          <Field label="Website" value={draft.website || ''} onChange={(value) => update('website', value)} />
          <div className="flex items-center gap-4"><button type="submit" className="rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90">Save Changes</button>{message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}</div>
        </form>
      </div>
    </section>
  );
}

function Field({ label, type = 'text', value, onChange }: { label: string; type?: string; value: string; onChange: (value: string) => void }) {
  return <label className="block font-medium">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-input-background px-4 py-3" /></label>;
}
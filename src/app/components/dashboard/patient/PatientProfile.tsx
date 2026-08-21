"use client";

interface PatientProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  medicalHistory: string;
}

interface PatientProfileProps {
  profile: PatientProfileData;
  onChange: (profile: PatientProfileData) => void;
}

const fields = [
  { label: "Full Name", key: "name", type: "text" },
  { label: "Email", key: "email", type: "email" },
  { label: "Phone", key: "phone", type: "tel" },
  { label: "Date of Birth", key: "dateOfBirth", type: "date" },
] as const;

export default function PatientProfile({ profile, onChange }: PatientProfileProps) {
  const update = (key: keyof PatientProfileData, value: string) => onChange({ ...profile, [key]: value });

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold">Profile Information</h2>
      <div className="rounded-lg border border-border bg-card p-6">
        <form className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {fields.map(({ label, key, type }) => (
              <label key={key} className="block font-medium">
                {label}
                <input type={type} value={profile[key]} onChange={(event) => update(key, event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring" />
              </label>
            ))}
          </div>
          <label className="block font-medium">
            Address
            <input type="text" value={profile.address} onChange={(event) => update("address", event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <label className="block font-medium">
            Medical History
            <textarea value={profile.medicalHistory} onChange={(event) => update("medicalHistory", event.target.value)} rows={4} placeholder="Enter any relevant medical history..." className="mt-2 w-full rounded-lg border border-border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <button type="submit" className="rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90">Save Changes</button>
        </form>
      </div>
    </section>
  );
}
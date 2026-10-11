"use client";

import { useState, useEffect } from "react";
import { Edit2, X, AlertCircle, CheckCircle2 } from "lucide-react";

interface PatientProfileData {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  phone: string;
}

interface PatientProfileProps {
  profile: PatientProfileData;
  onChange: (profile: PatientProfileData) => void;
  onSave: (profile: PatientProfileData) => Promise<void>;
}

const fields = [
  { label: "First Name", key: "firstName", type: "text", required: true },
  { label: "Last Name", key: "lastName", type: "text", required: true },
  { label: "Phone", key: "phone", type: "tel", required: true },
] as const;

export default function PatientProfile({
  profile,
  onChange,
  onSave,
}: PatientProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [errors, setErrors] = useState<Partial<Record<keyof PatientProfileData, string>>>({});
  const [initialProfile, setInitialProfile] = useState<PatientProfileData>(profile);

  // Disparition automatique du message après 4 secondes
  useEffect(() => {
    if (!saveMessage) return;
    const timer = setTimeout(() => {
      setSaveMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [saveMessage]);

  const handleEditClick = () => {
    setInitialProfile(profile);
    setIsEditing(true);
    setSaveMessage(null);
    setErrors({});
  };

  const handleCancelClick = () => {
    onChange(initialProfile);
    setIsEditing(false);
    setSaveMessage(null);
    setErrors({});
  };

  const update = (key: keyof PatientProfileData, value: string) => {
    onChange({ ...profile, [key]: value });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof PatientProfileData, string>> = {};

    if (!profile.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!profile.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    // Phone number validation
    const phoneRegex = /^\+?[0-9\s\-\(\)]{8,20}$/;
    if (!profile.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!phoneRegex.test(profile.phone)) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveMessage(null);
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave(profile);
      setSaveMessage({ type: "success", text: "Profile saved successfully." });
      setIsEditing(false);
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: error instanceof Error ? error.message : "We could not save your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Profile Information</h2>
        {!isEditing && (
          <button
            type="button"
            onClick={handleEditClick}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Edit2 size={16} /> Edit Profile
          </button>
        )}
      </div>

      {/* Success or error message visible above the card */}
      {saveMessage && (
        <div
          role="status"
          className={`mb-4 flex items-center justify-between rounded-lg p-3 text-sm shadow-sm transition-all animate-in fade-in ${
            saveMessage.type === "success"
              ? "bg-success-background text-success-foreground border border-success/30"
              : "bg-error-background text-error-foreground border border-error/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {saveMessage.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0 text-success" />
            ) : (
              <AlertCircle size={18} className="shrink-0 text-error" />
            )}
            <span className="font-medium">{saveMessage.text}</span>
          </div>
          <button
            onClick={() => setSaveMessage(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-6">
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-6 md:grid-cols-2">
            {fields.map(({ label, key, type, required }) => (
              <div key={key} className="relative">
                <label
                  htmlFor={`patient-${key}`}
                  className={`absolute -top-2 left-3 bg-card px-1 text-xs font-medium ${
                    errors[key] ? "text-error" : "text-muted-foreground"
                  }`}
                >
                  {label} {isEditing && required && <span className="text-red-500">*</span>}
                </label>

                {isEditing ? (
                  <>
                    <input
                      id={`patient-${key}`}
                      type={type}
                      value={profile[key]}
                      onChange={(event) => update(key, event.target.value)}
                      className={`w-full rounded-lg border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 ${
                        errors[key]
                          ? "border-error focus:ring-error"
                          : "border-border focus:ring-ring"
                      }`}
                    />
                    {errors[key] && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-error">
                        <AlertCircle size={12} /> {errors[key]}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-card-foreground">
                    {profile[key] || <span className="text-muted-foreground italic">Not specified</span>}
                  </div>
                )}
              </div>
            ))}

            {/* Email: Read only */}
            <div className="relative">
              <label htmlFor="patient-email" className="absolute -top-2 left-3 bg-card px-1 text-xs font-medium text-muted-foreground">
                Email
              </label>
              <div className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-muted-foreground">
                {profile.email}
              </div>
            </div>

            {/* Gender */}
            <div className="relative">
              <label htmlFor="patient-gender" className="absolute -top-2 left-3 bg-card px-1 text-xs font-medium text-muted-foreground">
                Gender
              </label>
              {isEditing ? (
                <select
                  id="patient-gender"
                  value={profile.gender}
                  onChange={(event) => update("gender", event.target.value)}
                  className="w-full rounded-lg border border-border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Not specified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <div className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 capitalize text-card-foreground">
                  {profile.gender || <span className="text-muted-foreground italic">Not specified</span>}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleCancelClick}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
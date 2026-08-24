"use client";

import { useState } from "react";

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
  {
    label: "First Name",
    key: "firstName",
    type: "text",
  },
  {
    label: "Last Name",
    key: "lastName",
    type: "text",
  },
  {
    label: "Phone",
    key: "phone",
    type: "tel",
  },
] as const;

export default function PatientProfile({
  profile,
  onChange,
  onSave,
}: PatientProfileProps) {
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const update = (
    key: keyof PatientProfileData,
    value: string
  ) => {
    onChange({
      ...profile,
      [key]: value,
    });
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setSaving(true);
    setSaveMessage("");

    try {
      await onSave(profile);
      setSaveMessage("Profile saved successfully.");
    } catch (error) {
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "We could not save your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold">
        Profile Information
      </h2>

      <div className="rounded-lg border border-border bg-card p-6">
        <form
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-6 md:grid-cols-2">

            {/* Editable fields */}
            {fields.map(
              ({ label, key, type }) => (
                <div
                  key={key}
                  className="relative"
                >
                  <label
                    htmlFor={`patient-${key}`}
                    className="absolute -top-2 left-3 bg-card px-1 text-xs font-medium text-muted-foreground"
                  >
                    {label}
                  </label>

                  <input
                    id={`patient-${key}`}
                    type={type}
                    value={profile[key]}
                    onChange={(event) =>
                      update(
                        key,
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )
            )}

            {/* Email - read only */}
            <div className="relative">
              <label
                htmlFor="patient-email"
                className="absolute -top-2 left-3 bg-card px-1 text-xs font-medium text-muted-foreground"
              >
                Email
              </label>

              <input
                id="patient-email"
                type="email"
                value={profile.email}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-border bg-muted px-4 py-3 text-muted-foreground focus:outline-none"
              />
            </div>

            {/* Gender */}
            <div className="relative">
              <label
                htmlFor="patient-gender"
                className="absolute -top-2 left-3 bg-card px-1 text-xs font-medium text-muted-foreground"
              >
                Gender
              </label>

              <select
                id="patient-gender"
                value={profile.gender}
                onChange={(event) =>
                  update(
                    "gender",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">
                  Not specified
                </option>

                <option value="male">
                  Male
                </option>

                <option value="female">
                  Female
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

            {saveMessage && (
              <p
                role="status"
                className="text-sm text-muted-foreground"
              >
                {saveMessage}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
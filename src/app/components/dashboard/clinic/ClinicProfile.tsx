"use client";

import { useState, useEffect } from "react";
import { Edit2, X, AlertCircle, CheckCircle2 } from "lucide-react";
import type { ClinicRecord } from "../../../dashboard/clinic/page";

interface ClinicProfileProps {
  clinic: ClinicRecord;
  onChange?: (clinic: ClinicRecord) => void;
  onSave: (clinic: ClinicRecord) => Promise<void>;
}

export default function ClinicProfile({
  clinic,
  onChange,
  onSave,
}: ClinicProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // État local temporaire pour l'édition
  const [formData, setFormData] = useState<ClinicRecord>(clinic);
  const [errors, setErrors] = useState<Partial<Record<keyof ClinicRecord, string>>>({});

  // Synchroniser le formulaire si la prop clinic change à l'extérieur
  useEffect(() => {
    if (!isEditing) {
      setFormData(clinic);
    }
  }, [clinic, isEditing]);

  useEffect(() => {
    if (!saveMessage) return;
    const timer = setTimeout(() => {
      setSaveMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [saveMessage]);

  const handleEditClick = () => {
    setFormData({ ...clinic });
    setIsEditing(true);
    setSaveMessage(null);
    setErrors({});
  };

  const handleCancelClick = () => {
    setFormData({ ...clinic });
    setIsEditing(false);
    setSaveMessage(null);
    setErrors({});
  };

  const update = (key: keyof ClinicRecord, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof ClinicRecord, string>> = {};

    if (!formData.clinic_name?.trim()) {
      newErrors.clinic_name = "Clinic name is required.";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    const phoneRegex = /^\+?[0-9\s\-\(\)]{8,20}$/;
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    if (!formData.country?.trim()) {
      newErrors.country = "Country is required.";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required.";
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
      await onSave(formData);
      if (onChange) {
        onChange(formData);
      }
      setSaveMessage({ type: "success", text: "Profile saved successfully." });
      setIsEditing(false);
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not save clinic profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const displayData = isEditing ? formData : clinic;

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Clinic Profile</h2>
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
            {/* Clinic Name */}
            <div className="relative">
              <label
                className={`absolute -top-2 left-3 bg-card px-1 text-xs font-medium ${
                  errors.clinic_name ? "text-error" : "text-muted-foreground"
                }`}
              >
                Clinic Name {isEditing && <span className="text-red-500">*</span>}
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={displayData.clinic_name || ""}
                    onChange={(e) => update("clinic_name", e.target.value)}
                    className={`w-full rounded-lg border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 ${
                      errors.clinic_name ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                    }`}
                  />
                  {errors.clinic_name && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-error">
                      <AlertCircle size={12} /> {errors.clinic_name}
                    </p>
                  )}
                </>
              ) : (
                <div className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-card-foreground">
                  {displayData.clinic_name || <span className="text-muted-foreground italic">Not specified</span>}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <label
                className={`absolute -top-2 left-3 bg-card px-1 text-xs font-medium ${
                  errors.email ? "text-error" : "text-muted-foreground"
                }`}
              >
                Email {isEditing && <span className="text-red-500">*</span>}
              </label>
              {isEditing ? (
                <>
                  <input
                    type="email"
                    value={displayData.email || ""}
                    onChange={(e) => update("email", e.target.value)}
                    className={`w-full rounded-lg border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 ${
                      errors.email ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-error">
                      <AlertCircle size={12} /> {errors.email}
                    </p>
                  )}
                </>
              ) : (
                <div className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-card-foreground">
                  {displayData.email || <span className="text-muted-foreground italic">Not specified</span>}
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="relative">
              <label
                className={`absolute -top-2 left-3 bg-card px-1 text-xs font-medium ${
                  errors.phone ? "text-error" : "text-muted-foreground"
                }`}
              >
                Phone {isEditing && <span className="text-red-500">*</span>}
              </label>
              {isEditing ? (
                <>
                  <input
                    type="tel"
                    value={displayData.phone || ""}
                    onChange={(e) => update("phone", e.target.value)}
                    className={`w-full rounded-lg border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 ${
                      errors.phone ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-error">
                      <AlertCircle size={12} /> {errors.phone}
                    </p>
                  )}
                </>
              ) : (
                <div className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-card-foreground">
                  {displayData.phone || <span className="text-muted-foreground italic">Not specified</span>}
                </div>
              )}
            </div>

            {/* Country */}
            <div className="relative">
              <label
                className={`absolute -top-2 left-3 bg-card px-1 text-xs font-medium ${
                  errors.country ? "text-error" : "text-muted-foreground"
                }`}
              >
                Country {isEditing && <span className="text-red-500">*</span>}
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={displayData.country || ""}
                    onChange={(e) => update("country", e.target.value)}
                    className={`w-full rounded-lg border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 ${
                      errors.country ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                    }`}
                  />
                  {errors.country && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-error">
                      <AlertCircle size={12} /> {errors.country}
                    </p>
                  )}
                </>
              ) : (
                <div className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-card-foreground">
                  {displayData.country || <span className="text-muted-foreground italic">Not specified</span>}
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="relative">
            <label
              className={`absolute -top-2 left-3 bg-card px-1 text-xs font-medium ${
                errors.address ? "text-error" : "text-muted-foreground"
              }`}
            >
              Address {isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={displayData.address || ""}
                  onChange={(e) => update("address", e.target.value)}
                  className={`w-full rounded-lg border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 ${
                    errors.address ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-error">
                    <AlertCircle size={12} /> {errors.address}
                  </p>
                )}
              </>
            ) : (
              <div className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-card-foreground">
                {displayData.address || <span className="text-muted-foreground italic">Not specified</span>}
              </div>
            )}
          </div>

          {/* Website */}
          <div className="relative">
            <label className="absolute -top-2 left-3 bg-card px-1 text-xs font-medium text-muted-foreground">
              Website
            </label>
            {isEditing ? (
              <input
                type="text"
                value={displayData.website || ""}
                onChange={(e) => update("website", e.target.value)}
                className="w-full rounded-lg border border-border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <div className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-card-foreground">
                {displayData.website || <span className="text-muted-foreground italic">Not specified</span>}
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
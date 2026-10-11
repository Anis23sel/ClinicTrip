"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Send, X, AlertCircle } from "lucide-react";
import InquirySuccess from "./InquirySuccess";
import { createClient } from "@/app/utils/supabase/client";

const supabase = createClient();
const MAX_DOCUMENT_SIZE = 2 * 1024 * 1024;

interface BookingInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInquiryCompleted: () => void;
  clinicName: string;
  clinicId: string;
  requestId?: string;
  surgeryName: string;
  startDate?: string;
  endDate?: string;
}

// function to hide contact information for the additonal field in the contact form
function hideContactInformation(text: string) {
  let sanitized = text;

  // Hide email addresses
  sanitized = sanitized.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
    "HIDDEN"
  );

  // Hide phone numbers
  sanitized = sanitized.replace(
    /(?<!\d)(?:\+|00)?\d[\d\s().-]{7,}\d(?!\d)/g,
    "HIDDEN"
  );

  return sanitized;
}

export default function BookingInquiryModal({
  isOpen,
  onClose,
  onInquiryCompleted,
  clinicName,
  clinicId,
  requestId,
  surgeryName,
  startDate,
  endDate,
}: BookingInquiryModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    procedure: surgeryName,
    startDate: startDate || "",
    endDate: endDate || "",
    details: "",
  });

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      procedure: surgeryName,
      startDate: startDate || "",
      endDate: endDate || "",
    }));

    setSubmitted(false);
    setError("");
    setFieldErrors({});
    setAttachmentFile(null);
    setForm((prev) => ({ ...prev, name: "", email: "" }));

    if (!isOpen) return;

    const loadSignedInUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be signed in to send an inquiry.");
        return;
      }

      const metadata = user.user_metadata || {};
      const name = metadata.full_name || metadata.name || metadata.display_name || user.email?.split("@")[0] || "";
      setForm((prev) => ({ ...prev, name, email: user.email || "" }));
    };

    loadSignedInUser();
  }, [surgeryName, startDate, endDate, isOpen, supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) {
      errors.name = "Full name is required.";
    }

    // Email Validation (regex)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!form.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!emailRegex.test(form.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!form.startDate) {
      errors.startDate = "Start date is required.";
    }

    if (!form.endDate) {
      errors.endDate = "End date is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    if (attachmentFile && attachmentFile.size > MAX_DOCUMENT_SIZE) {
      setError("The document must be 2 MB or smaller.");
      return;
    }

    const formData = new FormData();
    formData.append("clinicId", clinicId);
    if (requestId) formData.append("requestId", requestId);
    formData.append("name", hideContactInformation(form.name));
    formData.append("email", form.email);
    formData.append("procedure", form.procedure);
    formData.append("startDate", form.startDate);
    formData.append("endDate", form.endDate);
    formData.append("details", hideContactInformation(form.details));
    if (attachmentFile) formData.append("document", attachmentFile);

    const response = await fetch("/api/booking-inquiry", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.error || "We could not send your inquiry. Please try again.");
      return;
    }

    setSubmitted(true);
    onInquiryCompleted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-border bg-card shadow-2xl"
      >
        {/* Header (Fixe en haut) */}
        <div className="flex shrink-0 items-center justify-between border-b border-border p-6">
          <div>
            <h2 className="text-xl font-semibold">
              Request a Consultation
            </h2>

            <p className="mt-0.5 text-sm text-muted-foreground">
              {clinicName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-accent"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="overflow-y-auto p-6">
          {submitted ? (
            <InquirySuccess clinicName={clinicName} onClose={onClose} />
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              noValidate
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-sm font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                    }}
                    placeholder="Your full name"
                    className={`w-full rounded-lg border bg-input-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                      fieldErrors.name ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-error">
                      <AlertCircle size={12} /> {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                    }}
                    placeholder="your@email.com"
                    className={`w-full rounded-lg border bg-input-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                      fieldErrors.email ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-error">
                      <AlertCircle size={12} /> {fieldErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Surgery of Interest
                </label>

                <div className="w-full rounded-lg border border-border bg-input-background px-3 py-2.5 text-sm">
                  {form.procedure}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Start Date <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => {
                      setForm({ ...form, startDate: e.target.value });
                      if (fieldErrors.startDate) setFieldErrors({ ...fieldErrors, startDate: "" });
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full rounded-lg border bg-input-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                      fieldErrors.startDate ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                    }`}
                  />
                  {fieldErrors.startDate && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-error">
                      <AlertCircle size={12} /> {fieldErrors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    End Date <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => {
                      setForm({ ...form, endDate: e.target.value });
                      if (fieldErrors.endDate) setFieldErrors({ ...fieldErrors, endDate: "" });
                    }}
                    min={form.startDate || new Date().toISOString().split("T")[0]}
                    className={`w-full rounded-lg border bg-input-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                      fieldErrors.endDate ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                    }`}
                  />
                  {fieldErrors.endDate && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-error">
                      <AlertCircle size={12} /> {fieldErrors.endDate}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Additional Details
                </label>

                <textarea
                  rows={4}
                  value={form.details}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      details: e.target.value,
                    })
                  }
                  placeholder="Any questions, medical history details, or special requests..."
                  className="w-full resize-none rounded-lg border border-border bg-input-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Supporting Document <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,.pdf,.jpg,.jpeg"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0] || null;
                    if (selectedFile && selectedFile.size > MAX_DOCUMENT_SIZE) {
                      setAttachmentFile(null);
                      e.target.value = "";
                      setError("The document must be 2 MB or smaller.");
                      return;
                    }
                    setError("");
                    setAttachmentFile(selectedFile);
                  }}
                  className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF or JPEG only, maximum 2 MB.
                </p>
              </div>

              <p className="rounded-lg bg-accent/40 px-3 py-2 text-xs text-muted-foreground">
                Your inquiry will be sent directly to the clinic. They
                will contact you via email—no phone numbers are shared
                without your consent.
              </p>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Send size={16} />
                Send Inquiry to Clinic
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
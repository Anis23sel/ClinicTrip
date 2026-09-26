"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

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
        className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
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

        {submitted ? (
          <InquirySuccess clinicName={clinicName} onClose={onClose} />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium">
                  Full Name *
                </label>

                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="Your full name"
                  className="w-full rounded-lg border border-border bg-input-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium">
                  Email Address *
                </label>

                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  placeholder="your@email.com"
                  className="w-full rounded-lg border border-border bg-input-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
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
      Start Date *
    </label>

    <input
      type="date"
      required
      value={form.startDate}
      onChange={(e) =>
        setForm({
          ...form,
          startDate: e.target.value,
        })
      }
      min={new Date().toISOString().split("T")[0]}
      className="w-full rounded-lg border border-border bg-input-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  </div>

  <div>
    <label className="mb-1.5 block text-sm font-medium">
      End Date *
    </label>

    <input
      type="date"
      required
      value={form.endDate}
      onChange={(e) =>
        setForm({
          ...form,
          endDate: e.target.value,
        })
      }
      min={form.startDate || new Date().toISOString().split("T")[0]}
      className="w-full rounded-lg border border-border bg-input-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
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
  );
}
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CheckCircle, Send, X } from "lucide-react";

interface BookingInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicName: string;
  surgeryName: string;
  preferredDate?: string;
}

export default function BookingInquiryModal({
  isOpen,
  onClose,
  clinicName,
  surgeryName,
  preferredDate,
}: BookingInquiryModalProps) {
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    surgery: surgeryName,
    date: preferredDate || "",
    details: "",
  });

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      surgery: surgeryName,
      date: preferredDate || "",
    }));

    setSubmitted(false);
  }, [surgeryName, preferredDate, isOpen]);

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);

    // We'll connect this to the backend later.
    console.log(form);
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
              Request a Booking
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
          <div className="space-y-4 p-8 text-center">
            <CheckCircle
              size={56}
              className="mx-auto text-green-500"
            />

            <h3 className="text-xl font-semibold">
              Inquiry Sent!
            </h3>

            <p className="text-muted-foreground">
              Your inquiry has been forwarded to{" "}
              <strong>{clinicName}</strong>. They will contact you
              shortly using the email address you provided.
            </p>

            <button
              onClick={onClose}
              className="mt-4 rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90"
            >
              Close
            </button>
          </div>
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
                Surgery of Interest *
              </label>

              <input
                type="text"
                required
                value={form.surgery}
                onChange={(e) =>
                  setForm({
                    ...form,
                    surgery: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-border bg-input-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Preferred Date
              </label>

              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    date: e.target.value,
                  })
                }
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-border bg-input-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
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

            <p className="rounded-lg bg-accent/40 px-3 py-2 text-xs text-muted-foreground">
              Your inquiry will be sent directly to the clinic. They
              will contact you via email—no phone numbers are shared
              without your consent.
            </p>

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
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, Mail, Phone, Send } from "lucide-react";
import {
  CONTACT_TOPICS,
  type ContactSenderRole,
} from "@/app/contact/contactTopics";

type ContactFormValues = {
  fullName: string;
  email: string;
  phone: string;
  topic: string;
  otherSubject: string;
  message: string;
};

type ContactProfile = {
  fullName: string;
  email: string;
  senderRole: ContactSenderRole;
};

const emptyForm: ContactFormValues = {
  fullName: "",
  email: "",
  phone: "",
  topic: "",
  otherSubject: "",
  message: "",
};

function getRoleLabel(role: ContactSenderRole) {
  switch (role) {
    case "patient":
      return "Patient";
    case "clinic":
      return "Clinic";
    case "accommodation":
      return "Accommodation";
    default:
      return "Guest";
  }
}

export default function ContactPage() {
  const [form, setForm] = useState(emptyForm);
  const [profileRole, setProfileRole] = useState<ContactSenderRole | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/contact", { cache: "no-store" });
        const result = (await response.json()) as ContactProfile & { error?: string };

        if (!response.ok) {
          throw new Error(result.error || "We could not load your profile.");
        }

        if (active) {
          setProfileRole(result.senderRole);
          setForm((current) => ({
            ...current,
            fullName: current.fullName || result.fullName,
            email: current.email || result.email,
          }));
        }
      } catch (error) {
        console.error("Could not detect contact profile:", error);

        if (active) {
          setProfileError("Your account type will be checked when you send your message.");
        }
      } finally {
        if (active) setProfileLoading(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as {
        error?: string;
        senderRole?: ContactSenderRole;
      };

      if (!response.ok) {
        throw new Error(result.error || "We could not send your message.");
      }

      if (result.senderRole) setProfileRole(result.senderRole);
      setProfileError("");
      setSuccessMessage("Thank you. Your message has been sent to our team.");
      setForm((current) => ({
        ...emptyForm,
        fullName: current.fullName,
        email: current.email,
      }));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while sending your message."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const selectedTopic = CONTACT_TOPICS.find((topic) => topic.value === form.topic);

  return (
    <section className="bg-background px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-burnt-sienna">
            Contact ClinicTrip
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            We&apos;re here to help
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Tell us how we can help with your medical travel journey, and our team will
            get back to you.
          </p>
        </div>

        <div className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-deep-clay-brown/5 md:grid-cols-[0.85fr_1.15fr]">
          <aside className="relative overflow-hidden bg-primary p-8 text-primary-foreground sm:p-10 lg:p-12">

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blush-terracotta">
                Get in touch
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                Let&apos;s make your next step clearer.
              </h2>
              <p className="mt-4 max-w-sm leading-7 text-primary-foreground/80">
                Questions about treatment, our partner clinics, or planning your stay?
                We&apos;re happy to hear from you.
              </p>

              <div className="mt-10 space-y-4">
                <a
                  href="mailto:Info@clinic-trip.com"
                  className="group flex items-center gap-4 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-4 transition-colors hover:bg-primary-foreground/10"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-soft-clay text-primary">
                    <Mail size={20} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-primary-foreground/70">
                      Email us
                    </span>
                    <span className="mt-1 block break-all font-medium">
                      Info@clinic-trip.com
                    </span>
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="ml-auto shrink-0 text-primary-foreground/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>

                <a
                  href="tel:+905444030592"
                  className="group flex items-center gap-4 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-4 transition-colors hover:bg-primary-foreground/10"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-soft-clay text-primary">
                    <Phone size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-medium text-primary-foreground/70">
                      Call us
                    </span>
                    <span className="mt-1 block font-medium">+90 544 403 0592</span>
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="ml-auto shrink-0 text-primary-foreground/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>

              <p className="mt-8 border-t border-primary-foreground/15 pt-6 text-sm leading-6 text-primary-foreground/70">
                Prefer writing? Send us a message using the form and we&apos;ll respond
                by email.
              </p>
            </div>
          </aside>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Send us a message</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete the form and we&apos;ll be in touch.
                </p>
              </div>
              <div
                className="rounded-full bg-soft-clay px-3 py-1.5 text-xs font-medium text-deep-clay-brown"
                aria-live="polite"
              >
                {profileLoading
                  ? "Checking profile…"
                  : profileRole
                    ? `${getRoleLabel(profileRole)} profile`
                    : "Profile checked on submit"}
              </div>
            </div>

            {profileError && (
              <p className="mb-5 text-sm text-muted-foreground">{profileError}</p>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
                    Full name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={120}
                    value={form.fullName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, fullName: event.target.value }))
                    }
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    Email address <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, email: event.target.value }))
                    }
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                    Phone number <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={40}
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
                    placeholder="+90 544 403 0592"
                  />
                </div>
                <div>
                  <label htmlFor="topic" className="mb-2 block text-sm font-medium">
                    Subject <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    required
                    value={form.topic}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        topic: event.target.value,
                        otherSubject: "",
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
                  >
                    <option value="" disabled>
                      Choose a subject
                    </option>
                    {CONTACT_TOPICS.map((topic) => (
                      <option key={topic.value} value={topic.value}>
                        {topic.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedTopic?.value === "other" && (
                <div>
                  <label htmlFor="otherSubject" className="mb-2 block text-sm font-medium">
                    Your subject <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="otherSubject"
                    name="otherSubject"
                    type="text"
                    required
                    maxLength={120}
                    value={form.otherSubject}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        otherSubject: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
                    placeholder="What would you like to discuss?"
                  />
                </div>
              )}

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium">
                  Message <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={5}
                  value={form.message}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, message: event.target.value }))
                  }
                  className="w-full resize-y rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
                  placeholder="Share a few details so we can direct your message to the right team."
                />
                <p className="mt-2 text-right text-xs text-muted-foreground">
                  {form.message.length}/5000
                </p>
              </div>

              {errorMessage && (
                <p
                  role="alert"
                  className="rounded-xl border border-error/20 bg-error-background px-4 py-3 text-sm text-error-foreground"
                >
                  {errorMessage}
                </p>
              )}
              {successMessage && (
                <p
                  role="status"
                  className="rounded-xl border border-success/20 bg-success-background px-4 py-3 text-sm text-success-foreground"
                >
                  {successMessage}
                </p>
              )}

              <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={17} aria-hidden="true" />
                  {submitting ? "Sending…" : "Send message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

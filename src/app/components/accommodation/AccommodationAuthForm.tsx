"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, LockKeyhole, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";
import type { AccommodationAccount } from "@/app/components/accommodation/types";

type Props = { mode: "login" | "signup" };

export default function AccommodationAuthForm({ mode }: Props) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const isSignup = mode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [account, setAccount] = useState<Omit<AccommodationAccount, "id">>({
    email: "",
    propertyName: "",
    contactName: "",
    phone: "",
    city: "",
    address: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();
    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    if (isSignup) {
      if (password !== confirmPassword) {
        setError("Your passwords do not match.");
        return;
      }

      if (!account.propertyName.trim() || !account.contactName.trim() || !account.phone.trim() || !account.city.trim() || !account.address.trim()) {
        setError("Complete all property and contact fields before continuing.");
        return;
      }
    }

    setBusy(true);
    try {
      if (isSignup) {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              account_type: "accommodation",
              property_name: account.propertyName.trim(),
              contact_name: account.contactName.trim(),
              phone: account.phone.trim(),
              city: account.city.trim(),
              address: account.address.trim(),
              description: account.description.trim(),
            },
          },
        });

        if (signupError) throw signupError;
        if (!data.user) throw new Error("We couldn't create your account. Please try again.");
        if (!data.session) {
          setSuccess("Account created. Check your email to confirm your address, then sign in.");
          return;
        }
      } else {
        const { error: signinError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (signinError) throw signinError;

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("Please sign in again to continue.");

        const { data: partner, error: partnerError } = await supabase
          .from("accommodation_partners")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (partnerError) throw partnerError;
        if (!partner) {
          const { error: signoutError } = await supabase.auth.signOut();
          if (signoutError) throw signoutError;
          throw new Error("This account is not registered as an accommodation partner.");
        }
      }

      router.push("/dashboard/accommodation");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We couldn't complete your request. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const fieldClass =
    "w-full rounded-lg border border-border bg-input-background px-4 py-3 pl-11 text-foreground outline-none transition focus:ring-2 focus:ring-ring";

  return (
    <main className="min-h-[70vh] bg-accent/50 px-4 py-12">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:grid-cols-2">
        <section className="relative isolate min-h-80 overflow-hidden p-8 text-primary-foreground sm:p-10 md:min-h-full">
          <Image
            src="/hero-background.png"
            alt="A welcoming medical clinic overlooking Istanbul"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="absolute inset-0 -z-20 object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-primary/65" />
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-white">
            <ArrowLeft size={16} /> Back to ClinicTrip
          </Link>
          <div className="mt-10 max-w-sm sm:mt-14">
            <span className="inline-flex rounded-full border border-white/25 px-3 py-1 text-xs font-medium uppercase tracking-wide">
              Accommodation partners
            </span>
            <h1 className="mt-5 text-3xl font-bold leading-tight">
              {isSignup ? "Welcome more medical travelers." : "Your partner space, all in one place."}
            </h1>
            <p className="mt-4 leading-7 text-primary-foreground/80">
              {isSignup
                ? "Create a property listing for patients visiting Istanbul."
                : "Manage your property details and live room availability."}
            </p>
            <div className="mt-8 rounded-xl border border-white/20 bg-white/10 p-4 text-sm leading-6">
              Your listing and room rates are saved to the ClinicTrip database.
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <div className="mb-7">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
              <Building2 size={24} />
            </div>
            <h2 className="text-2xl font-bold">
              {isSignup ? "Register your property" : "Partner sign in"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignup ? "Set up your accommodation listing." : "Access your accommodation dashboard."}
            </p>
          </div>

          {error && (
            <p role="alert" className="mb-5 rounded-lg border border-error/30 bg-error-background p-3 text-sm text-error-foreground">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="mb-5 rounded-lg border border-success/30 bg-success-background p-3 text-sm text-success-foreground">
              {success}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <label className="relative block">
                  <span className="sr-only">Property name</span>
                  <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input required value={account.propertyName} onChange={(event) => setAccount({ ...account, propertyName: event.target.value })} placeholder="Property name" className={fieldClass} />
                </label>
                <label className="relative block">
                  <span className="sr-only">Contact person</span>
                  <UserRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input required value={account.contactName} onChange={(event) => setAccount({ ...account, contactName: event.target.value })} placeholder="Contact person" className={fieldClass} />
                </label>
                <label className="relative block">
                  <span className="sr-only">Phone</span>
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input required type="tel" value={account.phone} onChange={(event) => setAccount({ ...account, phone: event.target.value })} placeholder="Phone number" className={fieldClass} />
                </label>
                <label className="relative block">
                  <span className="sr-only">City</span>
                  <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input required value={account.city} onChange={(event) => setAccount({ ...account, city: event.target.value })} placeholder="City, country" className={fieldClass} />
                </label>
                <input required value={account.address} onChange={(event) => setAccount({ ...account, address: event.target.value })} placeholder="Property address" className="w-full rounded-lg border border-border bg-input-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring" />
                <textarea value={account.description} onChange={(event) => setAccount({ ...account, description: event.target.value })} placeholder="Tell patients about your property" rows={3} className="w-full rounded-lg border border-border bg-input-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring" />
              </>
            )}

            <label className="relative block">
              <span className="sr-only">Email</span>
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className={fieldClass} />
            </label>
            <label className="relative block">
              <span className="sr-only">Password</span>
              <LockKeyhole size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input required minLength={8} type="password" autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password (8+ characters)" className={fieldClass} />
            </label>
            {isSignup && (
              <input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm password" className="w-full rounded-lg border border-border bg-input-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring" />
            )}

            <button type="submit" disabled={busy} className="w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {busy ? "Please wait..." : isSignup ? "Create accommodation account" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? "Already registered? " : "New accommodation partner? "}
            <Link href={isSignup ? "/accommodation/login" : "/accommodation/signup"} className="font-medium text-primary hover:underline">
              {isSignup ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {isSignup ? "Looking for a patient or clinic account? " : "Patient or clinic? "}
            <Link href={isSignup ? "/signup" : "/login"} className="font-medium text-primary hover:underline">
              {isSignup ? "Choose your account type" : "Use regular sign in"}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

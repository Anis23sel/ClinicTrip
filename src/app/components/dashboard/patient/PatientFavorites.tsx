"use client";

import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import FavoriteButton from "@/app/components/search/FavoriteButton";
import { usePatientFavorites } from "@/app/components/search/usePatientFavorites";

// This component displays a list of clinics that the patient has saved as favorites. It uses the `usePatientFavorites` hook to fetch the patient's favorite clinics and their details. The component handles different states such as loading, error, and when there are no saved clinics. Each clinic is displayed in a card format with its name, rating, location, and a button to remove it from favorites. If the user is not signed in as a patient, a message prompts them to sign in to view saved clinics.
export default function PatientFavorites() {
  const { isPatient, favoriteClinicIds, pendingClinicIds, clinics: savedClinics, loading, error, toggleFavorite } = usePatientFavorites({ includeClinicDetails: true });
  const clinics = savedClinics.filter((clinic) => favoriteClinicIds.has(clinic.id));

  if (loading) {
    return <p className="text-muted-foreground">Loading your saved clinics...</p>;
  }

  if (error) {
    return <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>;
  }

  if (!isPatient) {
    return <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">Sign in with a patient account to view saved clinics.</div>;
  }

  if (clinics.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">No saved clinics yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Save a clinic from the search results and it will appear here.</p>
        <Link href="/search" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Explore clinics</Link>
      </div>
    );
  }

  return (
    <section aria-labelledby="favorites-heading">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 id="favorites-heading" className="text-xl font-semibold">Saved clinics</h2>
          <p className="mt-1 text-sm text-muted-foreground">{clinics.length} {clinics.length === 1 ? "clinic" : "clinics"} saved</p>
        </div>
        <Link href="/search" className="text-sm font-medium text-primary hover:underline">Find clinics</Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {clinics.map((clinic) => (
          <article key={clinic.id} className="relative overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">
            <Link href={`/clinic/${clinic.id}`} className="block">
              {clinic.image ? (
                <div
                  role="img"
                  aria-label={`${clinic.name} clinic`}
                  className="h-44 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url("${clinic.image}")` }}
                />
              ) : (
                <div className="h-44 w-full bg-gradient-to-br from-primary/20 to-primary/5" aria-hidden="true" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-foreground">{clinic.name}</h3>
                  <span className="flex shrink-0 items-center gap-1 rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-foreground">
                    <Star size={13} className="fill-yellow-400 text-yellow-400" />
                    {clinic.rating === null ? "New" : clinic.rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin size={14} /> {[clinic.city, clinic.country].filter(Boolean).join(", ") || "Location unavailable"}
                </p>
                {clinic.reviewCount > 0 && <p className="mt-1 text-xs text-muted-foreground">{clinic.reviewCount} {clinic.reviewCount === 1 ? "review" : "reviews"}</p>}
                <span className="mt-4 inline-block text-sm font-medium text-primary">View clinic →</span>
              </div>
            </Link>
            <div className="absolute right-3 top-3 z-10">
              <FavoriteButton
                clinicName={clinic.name}
                isFavorite
                isPending={pendingClinicIds.has(clinic.id)}
                isPatient={isPatient}
                onToggle={() => void toggleFavorite(clinic.id)}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

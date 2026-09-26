"use client";

import Link from "next/link";
import { Camera, DollarSign, MapPin, Star } from "lucide-react";
import type { ClinicResult } from "./searchTypes";

interface ClinicResultCardProps {
  clinic: ClinicResult;
  selectedProcedures?: string[];
}

export default function ClinicResultCard({
  clinic,
  selectedProcedures = [],
}: ClinicResultCardProps) {
  /*
   * Only add procedures to the clinic URL when the patient
   * actually selected procedure filters in the search page.
   *
   * IMPORTANT:
   * Do NOT automatically use clinic.procedures[0].
   *
   * If there are no selected procedures, the clinic page will
   * receive no "procedures" query parameter and will therefore
   * show ALL procedures offered by the clinic.
   */
  const query =
    selectedProcedures.length > 0
      ? `?procedures=${encodeURIComponent(
          selectedProcedures.join(",")
        )}`
      : "";

  return (
    <Link
      href={`/clinic/${clinic.id}${query}`}
      className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow"
    >
      <div className="flex flex-col md:flex-row">
        <div className="relative h-44 w-full shrink-0 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 md:w-72">
          {clinic.images.length > 0 ? (
            <img
              src={clinic.images[0].publicUrl}
              alt={clinic.images[0].caption || `${clinic.name} clinic`}
              className="absolute inset-0 block h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full" aria-hidden="true" />
          )}
          {clinic.images.length > 0 && (
            <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
              <Camera size={13} />
              {clinic.images.length} {clinic.images.length === 1 ? "photo" : "photos"}
            </span>
          )}
        </div>

        <div className="flex-1 p-6">
          {/* Clinic name + rating */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold">
              {clinic.name}
            </h3>

            <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1 rounded-lg shrink-0 border border-yellow-100">
              <Star
                size={14}
                className="fill-yellow-400 text-yellow-400"
              />

              <span className="font-semibold text-sm text-foreground">
                {clinic.rating ? clinic.rating.toFixed(1) : "Not rated"}
              </span>

              {clinic.reviewCount !== undefined && clinic.reviewCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({clinic.reviewCount})
                </span>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-muted-foreground mb-3 text-sm">
            <MapPin size={14} />

            <span>
              {clinic.city}, {clinic.country}
            </span>
          </div>

          {/* Procedures offered by the clinic */}
          <div className="flex flex-wrap gap-2 mb-4">
            {clinic.procedures.slice(0, 3).map((procedure) => (
              <span
                key={procedure}
                className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
              >
                {procedure}
              </span>
            ))}
          </div>

          {/* Doctors */}
          {clinic.doctors.length > 0 && (
            <div className="mb-4 border-t border-border pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Doctors at this clinic
              </p>

              <div className="space-y-2">
                {clinic.doctors.slice(0, 3).map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {doctor.name}
                      </p>

                      {doctor.speciality && (
                        <p className="text-xs text-muted-foreground">
                          {doctor.speciality}
                        </p>
                      )}
                    </div>

                    {doctor.procedures.length > 0 && (
                      <span className="text-right text-xs text-muted-foreground">
                        {doctor.procedures
                          .slice(0, 2)
                          .join(", ")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price + details */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <DollarSign
                size={14}
                className="text-muted-foreground"
              />

              <span className="text-xs text-muted-foreground">
                Starting from
              </span>

              <span className="font-semibold">
                ${clinic.startingPrice.toLocaleString()}
              </span>
            </div>

            <span className="text-primary font-medium text-sm">
              View Details -&gt;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

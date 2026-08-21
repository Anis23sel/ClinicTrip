"use client";

import Link from "next/link";
import { DollarSign, MapPin, Star } from "lucide-react";
import type { ClinicResult } from "./searchTypes";

interface ClinicResultCardProps {
  clinic: ClinicResult;
}

export default function ClinicResultCard({ clinic }: ClinicResultCardProps) {
  return (
    <Link
      href={`/clinic/${clinic.id}`}
      className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow"
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-72 h-44 md:h-auto bg-gradient-to-br from-primary/20 to-primary/10 shrink-0" />
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold">{clinic.name}</h3>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg shrink-0">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-sm">{clinic.rating ?? "Not rated"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground mb-3 text-sm">
            <MapPin size={14} />
            <span>{clinic.city}, {clinic.country}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {clinic.procedures.slice(0, 3).map((procedure) => (
              <span key={procedure} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                {procedure}
              </span>
            ))}
          </div>

          {clinic.doctors.length > 0 && (
            <div className="mb-4 border-t border-border pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Doctors at this clinic
              </p>
              <div className="space-y-2">
                {clinic.doctors.slice(0, 3).map((doctor) => (
                  <div key={doctor.id} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="font-medium">{doctor.name}</p>
                      {doctor.speciality && (
                        <p className="text-xs text-muted-foreground">{doctor.speciality}</p>
                      )}
                    </div>
                    {doctor.procedures.length > 0 && (
                      <span className="text-right text-xs text-muted-foreground">
                        {doctor.procedures.slice(0, 2).join(", ")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <DollarSign size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Starting from</span>
              <span className="font-semibold">${clinic.startingPrice.toLocaleString()}</span>
            </div>
            <span className="text-primary font-medium text-sm">View Details -&gt;</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

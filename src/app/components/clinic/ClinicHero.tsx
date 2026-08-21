import { MapPin, Star } from "lucide-react";
import type { ClinicData } from "./clinicData";

export default function ClinicHero({ clinic }: { clinic: ClinicData }) {
  return (
    <div className="bg-gradient-to-br from-primary to-primary/80 px-4 py-12 text-primary-foreground">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-4xl font-bold">{clinic.name}</h1>
        <div className="flex items-center gap-5 text-primary-foreground/90">
          <div className="flex items-center gap-2"><MapPin size={16} /><span>{clinic.city}, {clinic.country}</span></div>
          <div className="flex items-center gap-1"><Star size={16} className="fill-yellow-400 text-yellow-400" /><span className="font-semibold">{clinic.rating}</span><span className="text-sm opacity-80">({clinic.reviewCount} reviews)</span></div>
        </div>
      </div>
    </div>
  );
}
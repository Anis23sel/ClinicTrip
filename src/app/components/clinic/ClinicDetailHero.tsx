import { MapPin } from "lucide-react";
import type { ClinicDetailData } from "./ClinicDetailTypes";

export default function ClinicDetailHero({ clinic }: { clinic: ClinicDetailData }) {
  return <header className="bg-gradient-to-br from-primary to-primary/80 px-4 py-12 text-primary-foreground"><div className="mx-auto max-w-7xl"><h1 className="mb-2 text-4xl font-bold">{clinic.name}</h1><div className="flex items-center gap-2 text-primary-foreground/90"><MapPin size={16} /><span>{[clinic.city, clinic.state, clinic.country].filter(Boolean).join(", ")}</span></div></div></header>;
}

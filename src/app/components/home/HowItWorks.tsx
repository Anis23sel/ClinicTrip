import { Calendar, Heart, MapPin, Search } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search",
    description:
      "Browse clinics by procedure, location, and price range",
  },
  {
    icon: Heart,
    title: "Choose",
    description:
      "Select your clinic, procedure, and preferred doctor",
  },
  {
    icon: Calendar,
    title: "Book",
    description:
      "Schedule your procedure and accommodation in one step",
  },
  {
    icon: MapPin,
    title: "Travel",
    description:
      "Arrive with confidence knowing everything is arranged",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-12 text-center text-4xl font-bold text-foreground">
          How It Works
        </h2>

        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="text-primary" size={28} />
                </div>

                <h3 className="mb-2 text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
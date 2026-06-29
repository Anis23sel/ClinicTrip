import { Globe, Heart, Shield, Users } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Quality Care",
    description:
      "We partner only with verified, accredited clinics that meet international standards",
  },
  {
    icon: Shield,
    title: "Safety First",
    description:
      "Your safety and wellbeing are our top priorities in every step of your journey",
  },
  {
    icon: Globe,
    title: "Global Access",
    description:
      "Access to world-class healthcare, regardless of where you are in the world",
  },
  {
    icon: Users,
    title: "Patient-Centered",
    description:
      "Everything we do is designed around making your medical journey smooth and stress-free",
  },
];

export default function Values() {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <div key={value.title} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="text-primary" size={32} />
                </div>

                <h3 className="mb-2 text-xl font-semibold">
                  {value.title}
                </h3>

                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
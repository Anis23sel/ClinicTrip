import Link from "next/link";
import Image from "next/image";

const popularProcedures = [
  {
    id: 1,
    name: "Plastic Surgery",
    slug: "plastic-surgery",
    description:
      "Rhinoplasty, breast augmentation, liposuction, and more",
    image: "/plastic-surgery.png",
  },
  {
    id: 2,
    name: "Dental Procedures",
    slug: "dental",
    description:
      "Implants, veneers, whitening, and full smile makeovers",
    image: "/dental-procedures.png",
  },
  {
    id: 3,
    name: "Hair Transplant",
    slug: "hair-transplant",
    description:
      "Advanced FUE and DHI hair restoration techniques",
    image: "/hair-transplant.png",
  },
];

export default function PopularProcedures() {
  return (
    <section className="bg-card px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-12 text-center text-4xl font-bold">
          Popular Procedures
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {popularProcedures.map((procedure) => (
            <Link
              key={procedure.id}
              href={`/search?category=${procedure.slug}`}
              className="group overflow-hidden rounded-lg bg-background shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <Image
                  src={procedure.image}
                  alt={procedure.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="p-6">
                <h3 className="mb-2 text-xl font-semibold transition-colors group-hover:text-primary">
                  {procedure.name}
                </h3>

                <p className="mb-4 text-muted-foreground">
                  {procedure.description}
                </p>

                <span className="font-medium text-primary">
                  Explore clinics →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
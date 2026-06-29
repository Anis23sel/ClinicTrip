const stats = [
  { value: "50,000+", label: "Happy Patients" },
  { value: "250+", label: "Partner Clinics" },
  { value: "35+", label: "Countries" },
];

export default function Stats() {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg bg-primary/5 p-8 text-center"
            >
              <div className="mb-2 text-4xl font-bold text-primary">
                {stat.value}
              </div>

              <div className="text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
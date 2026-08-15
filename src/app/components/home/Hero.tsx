import Link from "next/link";
import { Search } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <h1 className="mb-6 text-5xl font-bold md:text-6xl">
            Your medical journey starts here
          </h1>

          <p className="mb-8 text-xl text-primary-foreground/90">
            Find world-class clinics, expert surgeons, and complete medical
            tourism packages all in one place.
          </p>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-lg bg-background px-8 py-4 text-foreground transition-opacity hover:opacity-90"
          >
            <Search size={20} />
            Explore Clinics
          </Link>
        </div>
      </div>
    </section>
  );
}
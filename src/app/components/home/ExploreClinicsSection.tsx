import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";

export default async function ExploreClinicsSection() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-6 text-4xl font-bold">
          Explore Clinics
        </h2>

        <p className="mb-8 text-xl text-muted-foreground">
          Browse through our verified network of partner clinics, compare specialized treatments, and find the perfect match for your medical journey.

        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/search"
            className="rounded-lg bg-primary px-8 py-4 text-primary-foreground transition-opacity hover:opacity-90"
          >
            Explore All Clinics
          </Link>
        </div>
      </div>
    </section>
  );
}
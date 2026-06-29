import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-6 text-4xl font-bold">
          Ready to Begin Your Journey?
        </h2>

        <p className="mb-8 text-xl text-muted-foreground">
          Join thousands of satisfied patients who trusted Clinic Trip for
          their medical tourism needs.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/search"
            className="rounded-lg bg-primary px-8 py-4 text-primary-foreground transition-opacity hover:opacity-90"
          >
            Find Your Clinic
          </Link>

          <Link
            href="/signup"
            className="rounded-lg border border-primary px-8 py-4 text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            Create Account
          </Link>
        </div>
      </div>
    </section>
  );
}
import Link from "next/link";

export default function JoinCommunity() {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-lg bg-gradient-to-br from-primary to-primary/80 p-12 text-center text-primary-foreground">
          <h2 className="mb-4 text-3xl font-bold">
            Join the Clinic Air Community
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-xl text-primary-foreground/90">
            Whether you're a patient seeking quality care or a clinic looking
            to reach international patients, we're here to help.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/search"
              className="rounded-lg bg-background px-8 py-4 text-foreground transition-opacity hover:opacity-90"
            >
              Find a Clinic
            </Link>

            <Link
              href="/signup"
              className="rounded-lg border border-primary-foreground px-8 py-4 text-primary-foreground transition-all hover:bg-primary-foreground hover:text-primary"
            >
              Register Your Clinic
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
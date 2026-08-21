import Link from "next/link";
import BookingCard from "../BookingCard";
import { mockrequests } from "../../mock/MockData";

export default function PatientRequests() {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Requests</h2>
        <Link href="/search" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-opacity hover:opacity-90">New Request</Link>
      </div>
      <div className="space-y-4">
        {mockrequests.map((request) => <BookingCard key={request.id} booking={request} />)}
      </div>
    </section>
  );
}
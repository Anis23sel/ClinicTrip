"use client";
import React, { JSX, useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import AccommodationTab from "../booking/AccommodationTab";
import TransferTab from "../booking/TransferTab";

type Booking = {
  id: number;
  clinicName: string;
  procedure: string;
  doctor: string;
  date: string;
  location: string;
  price: number;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  accommodation: string | null;
};

interface Props {
  booking: Booking;
}

const statusConfig: Record<Booking['status'], { color: string; icon: JSX.Element }> = {
  confirmed: { color: "bg-green-100 text-green-800", icon: <CheckCircle size={16} /> },
  pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock size={16} /> },
  completed: { color: "bg-blue-100 text-blue-800", icon: <CheckCircle size={16} /> },
  cancelled: { color: "bg-red-100 text-red-800", icon: <XCircle size={16} /> },
};

export default function BookingCard({ booking }: Props) {
  const cfg = statusConfig[booking.status];
  const [expanded, setExpanded] = useState(false);

  const sampleAccommodations = [
    {
      id: "1",
      name: "Partner Hotel Premium",
      distance: "5 min from clinic",
      roomTypes: [
        { type: "Single Room", price: 60 },
        { type: "Double Bed Room", price: 80 },
        { type: "Suite", price: 120 },
      ],
    },
    {
      id: "2",
      name: "Partner Hotel Standard",
      distance: "10 min from clinic",
      roomTypes: [
        { type: "Single Room", price: 40 },
        { type: "Double Bed Room", price: 55 },
      ],
    },
  ];

  const [localBooking, setLocalBooking] = useState({
    doctorId: "",
    date: booking.date || "",
    accommodationId: sampleAccommodations[0]?.id || "",
    roomType: sampleAccommodations[0]?.roomTypes[0]?.type || "",
    includeBreakfast: false,
    includeDinner: false,
    nights: 1,
    transferPackage: false,
  });
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">{booking.clinicName}</h3>
          <p className="text-muted-foreground">{booking.procedure}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${cfg.color}`}>
          {cfg.icon}
          <span className="capitalize">{booking.status}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Doctor</p>
          <p className="font-medium">{booking.doctor}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Date</p>
          <p className="font-medium">{booking.date}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Price</p>
          <p className="font-medium text-primary">${booking.price.toLocaleString()}</p>
        </div>
      </div>

      {booking.accommodation && (
        <div className="bg-accent/30 rounded p-3 mb-4">
          <p className="text-sm font-medium">Accommodation Included</p>
          <p className="text-sm text-muted-foreground">{booking.accommodation}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Link href={`/bookings/${booking.id}`} className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">View Details</Link>
        {booking.status === "pending" && (
          <button className="px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-all">Cancel</button>
        )}
      </div>

      <div className="mt-4">
        <button onClick={() => setExpanded((s) => !s)} className="text-sm font-medium text-primary hover:underline">{expanded ? "Hide" : "Manage Booking"}</button>
        {expanded && (
          <div className="mt-3 space-y-4">
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-full bg-primary/10 w-8 h-8 flex items-center justify-center font-semibold">1</div>
                <h4 className="font-semibold">Accommodation</h4>
              </div>
              <AccommodationTab accommodations={sampleAccommodations} booking={localBooking as any} setBooking={setLocalBooking as any} />
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-full bg-primary/10 w-8 h-8 flex items-center justify-center font-semibold">2</div>
                <h4 className="font-semibold">Transfer</h4>
              </div>
              <TransferTab booking={localBooking as any} setBooking={setLocalBooking as any} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

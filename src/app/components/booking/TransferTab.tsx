"use client";
import React from "react";
import { Plane, Car, Check } from "lucide-react";

type Booking = {
  doctorId: string;
  date: string;
  accommodationId: string;
  roomType: string;
  includeBreakfast: boolean;
  includeDinner: boolean;
  nights: number;
  transferPackage: boolean;
};

interface Props {
  booking: Booking;
  setBooking: React.Dispatch<React.SetStateAction<Booking>>;
}

export default function TransferTab({ booking, setBooking }: Props) {
  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold">Transfer Services</h3>
      <div className={`border-2 rounded-xl p-5 transition-all ${booking.transferPackage ? "border-primary bg-primary/5" : "border-border"}`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h4 className="font-semibold text-lg mb-1">Complete Transfer Package</h4>
            <p className="text-sm text-muted-foreground mb-3">Everything included — airport pick-up &amp; drop-off, plus daily clinic transfers.</p>
            <div className="text-primary font-bold text-xl">$80 <span className="text-sm font-normal text-muted-foreground">total</span></div>
          </div>
          {booking.transferPackage ? (
            <span className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold shrink-0"><Check size={14} /> Selected</span>
          ) : (
            <button onClick={() => setBooking({ ...booking, transferPackage: true })} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shrink-0">Select</button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-3 bg-background rounded-lg p-3">
            <Plane size={18} className="text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">Airport Transfer</p>
              <p className="text-xs text-muted-foreground">Round-trip to hotel</p>
              <p className="text-xs text-primary font-semibold">$50</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-background rounded-lg p-3">
            <Car size={18} className="text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">Clinic Transfers</p>
              <p className="text-xs text-muted-foreground">Daily hotel ↔ clinic</p>
              <p className="text-xs text-primary font-semibold">$30</p>
            </div>
          </div>
        </div>
        {booking.transferPackage && (
          <button onClick={() => setBooking({ ...booking, transferPackage: false })} className="mt-3 text-xs text-muted-foreground hover:text-destructive transition-colors">Remove selection</button>
        )}
      </div>
      <p className="text-sm text-muted-foreground bg-accent/30 rounded-xl p-4">
        All transfers include professional drivers and comfortable vehicles. Transfer times are coordinated with your appointment schedule.
      </p>
    </div>
  );
}

"use client";
import React from "react";
import { Check } from "lucide-react";

type RoomType = { type: string; price: number };
type Accommodation = { id: string; name: string; distance: string; roomTypes: RoomType[] };
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
  accommodations: Accommodation[];
  booking: Booking;
  setBooking: React.Dispatch<React.SetStateAction<Booking>>;
}

export default function AccommodationTab({ accommodations, booking, setBooking }: Props) {
  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold">Select Accommodation</h3>
      {accommodations.map((acc) => {
        const isSelected = booking.accommodationId === acc.id;
        return (
          <div key={acc.id} className={`border-2 rounded-xl p-5 transition-all ${isSelected ? "border-primary bg-primary/5" : "border-border"}`}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-lg">{acc.name}</h4>
                <p className="text-sm text-muted-foreground">{acc.distance}</p>
              </div>
              {isSelected ? (
                <span className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold shrink-0">
                  <Check size={14} /> Selected
                </span>
              ) : (
                <button
                  onClick={() => setBooking({ ...booking, accommodationId: acc.id, roomType: "" })}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
                >
                  Select
                </button>
              )}
            </div>
            {isSelected && (
              <div className="space-y-4 border-t border-border pt-4">
                <div>
                  <p className="text-sm font-medium mb-2">Room Type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {acc.roomTypes.map((room) => (
                      <button
                        key={room.type}
                        onClick={() => setBooking({ ...booking, roomType: room.type })}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${booking.roomType === room.type ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                      >
                        <div className="font-medium text-sm">{room.type}</div>
                        <div className="text-primary font-semibold text-sm">${room.price}/night</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Number of Nights</p>
                  <input
                    type="number" min="1" max="30"
                    value={booking.nights}
                    onChange={(e) => setBooking({ ...booking, nights: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={booking.includeBreakfast} onChange={(e) => setBooking({ ...booking, includeBreakfast: e.target.checked })} className="w-4 h-4 rounded border-border accent-primary" />
                    <span className="text-sm font-medium">Breakfast included</span>
                    <span className="text-primary text-sm ml-auto">+$15/night</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={booking.includeDinner} onChange={(e) => setBooking({ ...booking, includeDinner: e.target.checked })} className="w-4 h-4 rounded border-border accent-primary" />
                    <span className="text-sm font-medium">Dinner included</span>
                    <span className="text-primary text-sm ml-auto">+$25/night</span>
                  </label>
                </div>
                <button onClick={() => setBooking({ ...booking, accommodationId: "", roomType: "", includeBreakfast: false, includeDinner: false })} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                  Remove selection
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

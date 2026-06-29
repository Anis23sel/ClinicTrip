"use client";
import { useState } from "react";
import { Star, MapPin, Award, Car, Plane, Check } from "lucide-react";
import  BookingInquiryModal from "../../components/booking/BookingInquiryModal";

type BookingTab = "clinic" | "accommodation" | "transfer";

const mockClinicData = {
  id: 1,
  name: "Istanbul Medical Center",
  city: "Istanbul",
  country: "Turkey",
  rating: 4.8,
  reviewCount: 342,
  description: "Istanbul Medical Center is a leading healthcare facility with over 15 years of experience in medical tourism. Our state-of-the-art facility combines cutting-edge technology with compassionate care.",
  procedureName: "Rhinoplasty",
  procedureDescription: "Cosmetic nose surgery to enhance facial harmony and improve breathing.",
  procedurePrice: 2500,
  duration: "2–3 hours",
  recovery: "7–10 days",
  certifications: ["JCI Accredited", "ISO 9001 Certified", "Medical Tourism Association Member", "24/7 Emergency Care"],
  doctors: [
    { id: "1", name: "Dr. Mehmet Yilmaz", specialization: "Plastic & Reconstructive Surgery", experience: "18 years of experience" },
    { id: "2", name: "Dr. Ayse Demir", specialization: "Cosmetic Surgery Specialist", experience: "12 years of experience" },
  ],
  accommodations: [
    {
      id: "1",
      name: "Partner Hotel Premium",
      distance: "5 min walk from clinic",
      roomTypes: [
        { type: "Single Room", price: 60 },
        { type: "Double Bed Room", price: 80 },
        { type: "Suite", price: 120 },
      ],
    },
    {
      id: "2",
      name: "Partner Hotel Standard",
      distance: "10 min walk from clinic",
      roomTypes: [
        { type: "Single Room", price: 40 },
        { type: "Double Bed Room", price: 55 },
      ],
    },
  ],
};

export default function ClinicPage() {
  const clinic = mockClinicData;
  const [activeTab, setActiveTab] = useState<BookingTab>("clinic");
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [booking, setBooking] = useState({
    doctorId: "",
    date: "",
    accommodationId: "",
    roomType: "",
    includeBreakfast: false,
    includeDinner: false,
    nights: 1,
    transferPackage: false,
  });

  const selectedAccommodation = clinic.accommodations.find((a) => a.id === booking.accommodationId);
  const selectedRoom = selectedAccommodation?.roomTypes.find((r) => r.type === booking.roomType);

  const calculateTotal = () => {
    let total = 0;
    if (booking.doctorId) total += clinic.procedurePrice;
    if (selectedRoom) total += selectedRoom.price * booking.nights;
    if (booking.includeBreakfast) total += 15 * booking.nights;
    if (booking.includeDinner) total += 25 * booking.nights;
    if (booking.transferPackage) total += 80;
    return total;
  };

  const selectedDoctor = clinic.doctors.find((d) => d.id === booking.doctorId);
  const surgeryLabel = selectedDoctor ? `${clinic.procedureName} with ${selectedDoctor.name}` : clinic.procedureName;

  return (
    <>
      <BookingInquiryModal
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        clinicName={clinic.name}
        surgeryName={surgeryLabel}
        preferredDate={booking.date}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">{clinic.name}</h1>
            <div className="flex items-center gap-5 text-primary-foreground/90">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{clinic.city}, {clinic.country}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{clinic.rating}</span>
                <span className="text-sm opacity-80">({clinic.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Tabs */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl border border-border">
                <div className="border-b border-border flex">
                  {(["clinic", "accommodation", "transfer"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-4 px-6 border-b-2 transition-colors capitalize font-semibold text-sm ${activeTab === tab ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {/* Clinic Tab */}
                  {activeTab === "clinic" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">About the Clinic</h3>
                        <p className="text-muted-foreground leading-relaxed">{clinic.description}</p>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Procedure Details</h3>
                        <div className="border border-border rounded-xl p-4">
                          <h4 className="font-semibold mb-1">{clinic.procedureName}</h4>
                          <p className="text-muted-foreground text-sm mb-3">{clinic.procedureDescription}</p>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Duration</p>
                              <p className="font-medium text-sm">{clinic.duration}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Recovery</p>
                              <p className="font-medium text-sm">{clinic.recovery}</p>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-primary">${clinic.procedurePrice.toLocaleString()}</div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Select Doctor</h3>
                        <div className="space-y-3">
                          {clinic.doctors.map((doctor) => (
                            <label
                              key={doctor.id}
                              className={`flex gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${booking.doctorId === doctor.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                            >
                              <input
                                type="radio"
                                name="doctor"
                                value={doctor.id}
                                checked={booking.doctorId === doctor.id}
                                onChange={(e) => setBooking({ ...booking, doctorId: e.target.value })}
                                className="mt-1 accent-primary"
                              />
                              <div>
                                <h4 className="font-semibold">{doctor.name}</h4>
                                <p className="text-primary text-sm">{doctor.specialization}</p>
                                <p className="text-muted-foreground text-sm">{doctor.experience}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-sm">Preferred Date</label>
                        <input
                          type="date"
                          value={booking.date}
                          onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Certifications</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {clinic.certifications.map((cert, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Award size={16} className="text-primary shrink-0" />
                              <span className="text-sm">{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Accommodation Tab */}
                  {activeTab === "accommodation" && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-semibold">Select Accommodation</h3>
                      {clinic.accommodations.map((acc) => {
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
                  )}

                  {/* Transfer Tab */}
                  {activeTab === "transfer" && (
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
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-5">
              <div className="bg-primary/10 rounded-xl border-2 border-primary p-6">
                <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>
                <div className="space-y-2.5 text-sm">
                  {booking.doctorId && (
                    <div className="flex justify-between pb-2 border-b border-border">
                      <span className="text-muted-foreground">{clinic.procedureName}</span>
                      <span className="font-semibold">${clinic.procedurePrice.toLocaleString()}</span>
                    </div>
                  )}
                  {booking.accommodationId && booking.roomType && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{booking.roomType} × {booking.nights} night{booking.nights > 1 ? "s" : ""}</span>
                        <span className="font-semibold">${((selectedRoom?.price ?? 0) * booking.nights).toLocaleString()}</span>
                      </div>
                      {booking.includeBreakfast && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Breakfast × {booking.nights}</span>
                          <span className="font-semibold">${15 * booking.nights}</span>
                        </div>
                      )}
                      {booking.includeDinner && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dinner × {booking.nights}</span>
                          <span className="font-semibold">${25 * booking.nights}</span>
                        </div>
                      )}
                    </>
                  )}
                  {booking.transferPackage && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transfer Package</span>
                      <span className="font-semibold">$80</span>
                    </div>
                  )}
                  {calculateTotal() === 0 && (
                    <p className="text-muted-foreground text-xs italic">Select a doctor to start building your quote.</p>
                  )}
                </div>
                <div className="border-t-2 border-primary mt-4 pt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">Estimated Total</span>
                    <span className="font-bold text-2xl text-primary">${calculateTotal().toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">0 booking fees · Final price confirmed by clinic</p>
                </div>
                <button
                  onClick={() => setInquiryOpen(true)}
                  disabled={!booking.doctorId}
                  className="w-full mt-5 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                >
                  Book Now
                </button>
                {!booking.doctorId && <p className="text-xs text-muted-foreground text-center mt-2">Please select a doctor first</p>}
              </div>

              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-semibold mb-3">Route Map</h3>
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin size={44} className="mx-auto mb-2 text-primary/50" />
                    <p className="text-sm font-medium">Hotel ↔ Clinic</p>
                    <p className="text-xs opacity-70 mt-1">{clinic.city}, {clinic.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
"use client";
import { useState } from "react";
import { Star, MapPin, Award, Car, Plane, Check } from "lucide-react";
import Link from "next/link";
import  BookingInquiryModal from "../../components/booking/BookingInquiryModal";

type BookingTab = "clinic";

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
    startDate: "",
    endDate: "",
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
        preferredDate={booking.startDate}
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
                  {(["clinic"] as const).map((tab) => (
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
                      <div className="grid grid-cols-2 gap-4">
  {/* From */}
  <div>
    <label className="block text-sm font-medium mb-2">
      From
    </label>

    <input
      type="date"
      value={booking.startDate ?? ""}
      onChange={(e) =>
        setBooking((prev) => ({
          ...prev,
          startDate: e.target.value,
          endDate:
            prev.endDate && prev.endDate < e.target.value
              ? ""
              : prev.endDate,
        }))
      }
      min={new Date().toISOString().split("T")[0]}
      className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
    />
  </div>

  {/* To */}
  <div>
    <label className="block text-sm font-medium mb-2">
      To
    </label>

    <input
      type="date"
      value={booking.endDate ?? ""}
      onChange={(e) =>
        setBooking((prev) => ({
          ...prev,
          endDate: e.target.value,
        }))
      }
      min={booking.startDate || new Date().toISOString().split("T")[0]}
      disabled={!booking.startDate}
      className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
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

                 
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-5">
              <div className="bg-primary/10 rounded-xl border-2 border-primary p-6">
                <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>
                <div className="text-sm">
                  <p className="text-muted-foreground">Starting price</p>
                  <div className="font-bold text-2xl text-primary mb-2">${clinic.procedurePrice.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Sign in and start now</p>
                </div>
                <Link href="/login" className="w-full mt-5 inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-center font-semibold">
                  Sign in and start now
                </Link>
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

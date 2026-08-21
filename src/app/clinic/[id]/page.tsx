"use client";
import { useState, type CSSProperties } from "react";
import { Star, MapPin, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import BookingInquiryModal from "../../components/booking/BookingInquiryModal";
import { createClient } from "@/app/utils/supabase/client";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { format } from "date-fns";

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
  const router = useRouter();
  const supabase = createClient();
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

  const handleContactClinic = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setInquiryOpen(true);
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: booking.startDate ? new Date(booking.startDate) : undefined,
    to: booking.endDate ? new Date(booking.endDate) : undefined,
  });

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);

    setBooking((prev) => ({
      ...prev,
      startDate: range?.from ? format(range.from, "yyyy-MM-dd") : "",
      endDate: range?.to ? format(range.to, "yyyy-MM-dd") : "",
    }));
  };

  return (
    <>
      <BookingInquiryModal
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        clinicName={clinic.name}
        clinicId={String(clinic.id)}
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
                          <div className="text-sm text-muted-foreground">Payment at the clinic</div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Select Doctor</h3>
                        <p className="text-sm text-muted-foreground mb-4">You can choose your doctor later if you prefer.</p>
                        <div className="space-y-3">
                          <label
                            className={`flex gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${booking.doctorId === "" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                          >
                            <input
                              type="radio"
                              name="doctor"
                              value=""
                              checked={booking.doctorId === ""}
                              onChange={(e) => setBooking({ ...booking, doctorId: e.target.value })}
                              className="mt-1 accent-primary"
                            />
                            <div>
                              <h4 className="font-semibold">Choose the doctor later</h4>
                              <p className="text-muted-foreground text-sm">We’ll help you select the right specialist after your inquiry.</p>
                            </div>
                          </label>
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
                      <div className="space-y-4">
                        <label className="block text-sm font-medium">Dates</label>

                        <div className="rounded-lg border border-border bg-input-background p-3 sm:p-4">
                          <div className="overflow-x-auto">
                            <DayPicker
                              mode="range"
                              selected={dateRange}
                              onSelect={handleDateRangeChange}
                              disabled={{ before: new Date() }}
                              numberOfMonths={2}
                              pagedNavigation
                              captionLayout="dropdown"
                              className="clinic-calendar mx-auto"
                              style={
                                {
                                  "--rdp-accent-color": "#391419",
                                  "--rdp-accent-background-color": "rgba(57, 20, 25, 0.12)",
                                  "--rdp-range_start-color": "#ffffff",
                                  "--rdp-range_end-color": "#ffffff",
                                  "--rdp-range_middle-color": "#391419",
                                  "--rdp-range_middle-background-color": "rgba(57, 20, 25, 0.12)",
                                  "--rdp-selected-border": "1px solid #391419",
                                } as CSSProperties
                              }
                              styles={{
                                months: {
                                  display: "flex",
                                  flexDirection: "row",
                                  gap: "1.5rem",
                                  justifyContent: "center",
                                  alignItems: "flex-start",
                                },
                                month: {
                                  margin: 0,
                                },
                              }}
                              modifiersStyles={{
                                range_start: {
                                  backgroundColor: "#391419",
                                  color: "#ffffff",
                                  borderRadius: "9999px",
                                },
                                range_end: {
                                  backgroundColor: "#391419",
                                  color: "#ffffff",
                                  borderRadius: "9999px",
                                },
                                range_middle: {
                                  backgroundColor: "rgba(57, 20, 25, 0.12)",
                                  color: "#391419",
                                  borderRadius: 0,
                                },
                                selected: {
                                  backgroundColor: "#391419",
                                  color: "#ffffff",
                                  borderRadius: "9999px",
                                },
                              }}
                            />
                          </div>
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
                
                {/*<h3 className="font-semibold text-lg mb-4">Booking Summary</h3>*/}
                <button
                  type="button"
                  onClick={handleContactClinic}
                  className="w-full mt-5 inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-center font-semibold"
                >
                   Contact the clinic and start now
                </button>
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

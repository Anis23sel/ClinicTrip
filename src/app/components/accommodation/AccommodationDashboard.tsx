"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  DoorOpen,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  Save,
  Star,
  Users,
  X,
} from "lucide-react";
import {
  accommodationSessionKey,
  demoAccommodation,
  getAccommodationAccount,
  saveAccommodationAccount,
  type AccommodationAccount,
} from "@/app/components/accommodation/staticAccommodation";

type Tab = "overview" | "property" | "rooms" | "reservations";
type ReservationStatus = "Pending" | "Confirmed" | "Declined";
type Reservation = {
  id: string;
  guest: string;
  checkIn: string;
  checkOut: string;
  room: string;
  guests: number;
  status: ReservationStatus;
};
type Room = { id: number; name: string; price: number; available: number };

const initialReservations: Reservation[] = [
  { id: "CT-2048", guest: "Olivia Carter", checkIn: "Nov 18, 2026", checkOut: "Nov 24, 2026", room: "Deluxe Double", guests: 2, status: "Pending" },
  { id: "CT-2047", guest: "Noah Williams", checkIn: "Nov 20, 2026", checkOut: "Nov 27, 2026", room: "Accessible Suite", guests: 1, status: "Confirmed" },
  { id: "CT-2046", guest: "Amelia Brown", checkIn: "Nov 22, 2026", checkOut: "Nov 25, 2026", room: "Standard Twin", guests: 2, status: "Pending" },
];

const initialRooms: Room[] = [
  { id: 1, name: "Standard Twin", price: 85, available: 6 },
  { id: 2, name: "Deluxe Double", price: 120, available: 4 },
  { id: 3, name: "Accessible Suite", price: 165, available: 2 },
];

const tabs: { id: Tab; label: string; icon: typeof Building2 }[] = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "property", label: "Property profile", icon: MapPin },
  { id: "rooms", label: "Rooms & rates", icon: BedDouble },
  { id: "reservations", label: "Stay requests", icon: ClipboardList },
];

export default function AccommodationDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [account, setAccount] = useState<AccommodationAccount | null>(null);
  const [reservations, setReservations] = useState(initialReservations);
  const [rooms, setRooms] = useState(initialRooms);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AccommodationAccount>(demoAccommodation);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const email = window.sessionStorage.getItem(accommodationSessionKey);
      if (!email) {
        router.replace("/accommodation/login");
        return;
      }
      const signedInAccount = getAccommodationAccount(email);
      if (!signedInAccount) {
        window.sessionStorage.removeItem(accommodationSessionKey);
        router.replace("/accommodation/login");
        return;
      }
      setAccount(signedInAccount);
      setForm(signedInAccount);
    } catch {
      setError("We couldn't load this browser's demo data. Check your storage settings and refresh.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const pendingCount = useMemo(
    () => reservations.filter((reservation) => reservation.status === "Pending").length,
    [reservations],
  );

  const signOut = () => {
    window.sessionStorage.removeItem(accommodationSessionKey);
    router.replace("/accommodation/login");
  };

  const saveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!account) return;
    try {
      saveAccommodationAccount({ ...form, email: account.email });
      setAccount({ ...form, email: account.email });
      setIsEditing(false);
      setNotice("Property profile saved in this browser.");
    } catch {
      setError("We couldn't save your changes in this browser. Check your storage settings and try again.");
    }
  };

  const updateReservation = (id: string, status: ReservationStatus) => {
    setReservations((current) =>
      current.map((reservation) => (reservation.id === id ? { ...reservation, status } : reservation)),
    );
    setNotice(`Stay request ${id} marked ${status.toLowerCase()}.`);
  };

  if (loading) {
    return <main className="min-h-[60vh] px-4 py-16 text-center text-muted-foreground">Opening your accommodation dashboard...</main>;
  }

  if (error && !account) {
    return <main role="alert" className="min-h-[60vh] px-4 py-16 text-center text-error">{error}</main>;
  }

  if (!account) return null;

  return (
    <main className="min-h-screen bg-accent/40 pb-12">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Accommodation partner</p>
              <h1 className="text-xl font-bold">{account.propertyName}</h1>
            </div>
          </div>
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit rounded-xl border border-border bg-card p-3">
            <nav aria-label="Accommodation dashboard" className="flex gap-2 overflow-x-auto lg:flex-col">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setActiveTab(id); setNotice(""); }} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition lg:w-full ${activeTab === id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"}`}>
                  <Icon size={18} /> {label}
                </button>
              ))}
            </nav>
            <div className="mt-5 hidden rounded-lg bg-accent p-4 lg:block">
              <p className="text-sm font-semibold">Need help?</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Your partner support team can help you prepare your property listing.</p>
            </div>
          </aside>

          <section className="min-w-0">
            {error && <p role="alert" className="mb-4 rounded-lg bg-error-background p-3 text-sm text-error-foreground">{error}</p>}
            {notice && <p role="status" className="mb-4 rounded-lg bg-success-background p-3 text-sm text-success-foreground">{notice}</p>}

            {activeTab === "overview" && (
              <>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Welcome back, {account.contactName.split(" ")[0]}</p>
                    <h2 className="mt-1 text-2xl font-bold">Property overview</h2>
                  </div>
                  <button onClick={() => setActiveTab("property")} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent">
                    View property <ChevronRight size={16} />
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Stay requests", value: reservations.length, note: "All time", icon: ClipboardList },
                    { label: "Needs your response", value: pendingCount, note: "Pending requests", icon: CalendarDays },
                    { label: "Room types", value: rooms.length, note: "Currently listed", icon: DoorOpen },
                    { label: "Guest rating", value: "4.9", note: "From 38 reviews", icon: Star },
                  ].map(({ label, value, note, icon: Icon }) => (
                    <div key={label} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-sm">{label}</span><Icon size={18} />
                      </div>
                      <p className="mt-4 text-3xl font-bold">{value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold">Recent stay requests</h3>
                      <button onClick={() => setActiveTab("reservations")} className="text-sm font-medium text-primary hover:underline">View all</button>
                    </div>
                    <ReservationList reservations={reservations.slice(0, 3)} onUpdate={updateReservation} compact />
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-accent p-2 text-primary"><MapPin size={18} /></div>
                      <div>
                        <h3 className="font-semibold">Your property</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{account.city}</p>
                      </div>
                    </div>
                    <div className="mt-5 border-t border-border pt-4">
                      <p className="font-medium">{account.propertyName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{account.address}</p>
                      <p className="mt-4 text-sm text-muted-foreground">{account.description}</p>
                      <button onClick={() => setActiveTab("property")} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                        Edit property details <Pencil size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "property" && (
              <div className="rounded-xl border border-border bg-card p-5 sm:p-7">
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">Property profile</h2>
                    <p className="mt-1 text-sm text-muted-foreground">The information patients see when exploring your stay.</p>
                  </div>
                  {!isEditing && <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent"><Pencil size={15} /> Edit</button>}
                </div>
                <form onSubmit={saveProfile} className="grid gap-5 sm:grid-cols-2">
                  <ProfileField label="Property name" value={form.propertyName} disabled={!isEditing} onChange={(value) => setForm({ ...form, propertyName: value })} />
                  <ProfileField label="Contact person" value={form.contactName} disabled={!isEditing} onChange={(value) => setForm({ ...form, contactName: value })} />
                  <ProfileField label="Email" value={form.email} disabled onChange={() => {}} />
                  <ProfileField label="Phone" value={form.phone} disabled={!isEditing} onChange={(value) => setForm({ ...form, phone: value })} />
                  <ProfileField label="City and country" value={form.city} disabled={!isEditing} onChange={(value) => setForm({ ...form, city: value })} />
                  <ProfileField label="Address" value={form.address} disabled={!isEditing} onChange={(value) => setForm({ ...form, address: value })} />
                  <label className="sm:col-span-2">
                    <span className="mb-2 block text-sm font-medium">About your property</span>
                    <textarea rows={4} disabled={!isEditing} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full rounded-lg border border-border bg-input-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring disabled:bg-accent disabled:text-muted-foreground" />
                  </label>
                  {isEditing && (
                    <div className="flex gap-3 sm:col-span-2">
                      <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"><Save size={16} /> Save changes</button>
                      <button type="button" onClick={() => { setForm(account); setIsEditing(false); }} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-accent">Cancel</button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {activeTab === "rooms" && (
              <div className="rounded-xl border border-border bg-card p-5 sm:p-7">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">Rooms & rates</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Example room inventory for your property preview.</p>
                </div>
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div key={room.id} className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-[1fr_130px_130px] sm:items-center">
                      <div className="flex items-center gap-3"><div className="rounded-lg bg-accent p-2 text-primary"><BedDouble size={18} /></div><div><p className="font-semibold">{room.name}</p><p className="text-xs text-muted-foreground">{room.available} rooms available</p></div></div>
                      <label className="text-sm"><span className="mb-1 block text-xs text-muted-foreground">Rate / night ($)</span><input aria-label={`${room.name} rate per night`} type="number" min="1" value={room.price} onChange={(event) => setRooms((current) => current.map((item) => item.id === room.id ? { ...item, price: Number(event.target.value) } : item))} className="w-full rounded-md border border-border bg-input-background px-3 py-2" /></label>
                      <label className="text-sm"><span className="mb-1 block text-xs text-muted-foreground">Available rooms</span><input aria-label={`${room.name} available rooms`} type="number" min="0" value={room.available} onChange={(event) => setRooms((current) => current.map((item) => item.id === room.id ? { ...item, available: Number(event.target.value) } : item))} className="w-full rounded-md border border-border bg-input-background px-3 py-2" /></label>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setRooms((current) => [...current, { id: Date.now(), name: "New room type", price: 100, available: 1 }]); setNotice("A sample room type was added."); }} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-accent"><Plus size={16} /> Add room type</button>
                <p className="mt-4 text-xs text-muted-foreground">Room edits are temporary and will reset when this page is refreshed.</p>
              </div>
            )}

            {activeTab === "reservations" && (
              <div className="rounded-xl border border-border bg-card p-5 sm:p-7">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Stay requests</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Review sample requests from patients planning treatment.</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">{pendingCount} pending</span>
                </div>
                <ReservationList reservations={reservations} onUpdate={updateReservation} />
              </div>
            )}
          </section>
        </div>
        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><Users size={14} /> Signed in as {account.email}</p>
      </div>
    </main>
  );
}

function ProfileField({ label, value, disabled, onChange }: { label: string; value: string; disabled: boolean; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input required value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-border bg-input-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring disabled:bg-accent disabled:text-muted-foreground" />
    </label>
  );
}

function ReservationList({ reservations, onUpdate, compact = false }: { reservations: Reservation[]; onUpdate: (id: string, status: ReservationStatus) => void; compact?: boolean }) {
  return (
    <div className="space-y-3">
      {reservations.map((reservation) => (
        <article key={reservation.id} className="rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{reservation.guest}</p>
              <p className="mt-1 text-xs text-muted-foreground">{reservation.id} · {reservation.guests} guests</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${reservation.status === "Pending" ? "bg-amber-100 text-amber-900" : reservation.status === "Confirmed" ? "bg-success-background text-success-foreground" : "bg-error-background text-error-foreground"}`}>{reservation.status}</span>
          </div>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <p><span className="text-muted-foreground">Room:</span> {reservation.room}</p>
            <p><span className="text-muted-foreground">Dates:</span> {reservation.checkIn} – {reservation.checkOut}</p>
          </div>
          {!compact && reservation.status === "Pending" && (
            <div className="mt-4 flex gap-2">
              <button onClick={() => onUpdate(reservation.id, "Confirmed")} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"><Check size={14} /> Confirm</button>
              <button onClick={() => onUpdate(reservation.id, "Declined")} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-accent"><X size={14} /> Decline</button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

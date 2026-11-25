"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BedDouble,
  Building2,
  CalendarDays,
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
} from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";
import type { AccommodationAccount, AccommodationRoom } from "@/app/components/accommodation/types";

type Tab = "overview" | "property" | "rooms" | "reservations";

const tabs: { id: Tab; label: string; icon: typeof Building2 }[] = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "property", label: "Property profile", icon: MapPin },
  { id: "rooms", label: "Rooms & rates", icon: BedDouble },
  { id: "reservations", label: "Stay requests", icon: ClipboardList },
];

export default function AccommodationDashboard() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [account, setAccount] = useState<AccommodationAccount | null>(null);
  const [rooms, setRooms] = useState<AccommodationRoom[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Omit<AccommodationAccount, "id">>({
    email: "",
    propertyName: "",
    contactName: "",
    phone: "",
    city: "",
    address: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          router.replace("/accommodation/login");
          return;
        }

        const { data: partner, error: partnerError } = await supabase
          .from("accommodation_partners")
          .select("accommodation_id, email, contact_name, phone")
          .eq("user_id", user.id)
          .maybeSingle();
        if (partnerError) throw partnerError;
        if (!partner) {
          const { error: signoutError } = await supabase.auth.signOut();
          if (signoutError) throw signoutError;
          router.replace("/accommodation/login");
          return;
        }

        const [{ data: property, error: propertyError }, { data: roomRows, error: roomsError }] = await Promise.all([
          supabase
            .from("accommodations")
            .select("id, name, city, address, description")
            .eq("id", partner.accommodation_id)
            .single(),
          supabase
            .from("accommodation_rooms")
            .select("id, room_name, price_per_night, available_rooms")
            .eq("accommodation_id", partner.accommodation_id)
            .order("room_name"),
        ]);
        if (propertyError) throw propertyError;
        if (roomsError) throw roomsError;
        if (!property) throw new Error("We couldn't find the property linked to your account.");

        if (cancelled) return;
        const nextAccount: AccommodationAccount = {
          id: property.id,
          email: partner.email,
          propertyName: property.name,
          contactName: partner.contact_name,
          phone: partner.phone,
          city: property.city,
          address: property.address,
          description: property.description ?? "",
        };
        setAccount(nextAccount);
        setForm({
          email: nextAccount.email,
          propertyName: nextAccount.propertyName,
          contactName: nextAccount.contactName,
          phone: nextAccount.phone,
          city: nextAccount.city,
          address: nextAccount.address,
          description: nextAccount.description,
        });
        setRooms((roomRows ?? []).map((room) => ({
          id: room.id,
          name: room.room_name,
          price: Number(room.price_per_night),
          available: room.available_rooms,
        })));
        setError("");
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "We couldn't load your accommodation data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadDashboard();

    const channel = supabase
      .channel("accommodation-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "accommodations" }, () => {
        void loadDashboard();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "accommodation_rooms" }, () => {
        void loadDashboard();
      })
      .subscribe((status) => {
        if ((status === "CHANNEL_ERROR" || status === "TIMED_OUT") && !cancelled) {
          setError("Live updates are unavailable. Refresh the page to reload the latest data.");
        }
      });

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  const signOut = async () => {
    const { error: signoutError } = await supabase.auth.signOut();
    if (signoutError) {
      setError(signoutError.message);
      return;
    }
    router.replace("/accommodation/login");
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!account) return;
    setError("");
    setNotice("");
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      setError(userError.message);
      return;
    }
    if (!user) {
      router.replace("/accommodation/login");
      return;
    }
    const [{ error: propertyError }, { error: partnerError }] = await Promise.all([
      supabase
        .from("accommodations")
        .update({
          name: form.propertyName.trim(),
          city: form.city.trim(),
          address: form.address.trim(),
          description: form.description.trim(),
        })
        .eq("id", account.id)
        .select("id")
        .single(),
      supabase
        .from("accommodation_partners")
        .update({
          contact_name: form.contactName.trim(),
          phone: form.phone.trim(),
        })
        .eq("user_id", user.id)
        .select("user_id")
        .single(),
    ]);
    if (propertyError || partnerError) {
      setError(propertyError?.message ?? partnerError?.message ?? "We couldn't save your property details.");
      return;
    }
    setAccount({
      ...account,
      propertyName: form.propertyName.trim(),
      contactName: form.contactName.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      description: form.description.trim(),
    });
    setIsEditing(false);
    setNotice("Property profile saved.");
  };

  const updateRoom = async (room: AccommodationRoom) => {
    setError("");
    const { error: updateError } = await supabase
      .from("accommodation_rooms")
      .update({
        room_name: room.name.trim(),
        price_per_night: room.price,
        available_rooms: room.available,
      })
      .eq("id", room.id)
      .select("id")
      .single();
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setNotice(`${room.name.trim()} saved.`);
  };

  const addRoom = async () => {
    if (!account) return;
    setError("");
    const { data: room, error: insertError } = await supabase
      .from("accommodation_rooms")
      .insert({
        accommodation_id: account.id,
        room_name: "New room type",
        price_per_night: 100,
        available_rooms: 1,
      })
      .select("id, room_name, price_per_night, available_rooms")
      .single();
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setRooms((current) => [...current, {
      id: room.id,
      name: room.room_name,
      price: Number(room.price_per_night),
      available: room.available_rooms,
    }]);
    setNotice("Room type added.");
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
                    { label: "Stay requests", value: 0, note: "No requests yet", icon: ClipboardList },
                    { label: "Needs your response", value: 0, note: "Pending requests", icon: CalendarDays },
                    { label: "Room types", value: rooms.length, note: "Currently listed", icon: DoorOpen },
                    { label: "Guest rating", value: "—", note: "No reviews yet", icon: Star },
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
                    <p className="py-5 text-sm text-muted-foreground">Stay requests will appear here when bookings are connected.</p>
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
                  <p className="mt-1 text-sm text-muted-foreground">Set real room rates and availability for patients.</p>
                </div>
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div key={room.id} className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-[1fr_130px_130px] sm:items-center">
                      <div className="flex items-center gap-3"><div className="rounded-lg bg-accent p-2 text-primary"><BedDouble size={18} /></div><label className="min-w-0 flex-1"><span className="sr-only">Room type name</span><input aria-label="Room type name" value={room.name} onChange={(event) => setRooms((current) => current.map((item) => item.id === room.id ? { ...item, name: event.target.value } : item))} onBlur={() => void updateRoom(room)} className="w-full rounded-md border border-border bg-input-background px-3 py-2 font-semibold" /><span className="text-xs text-muted-foreground">{room.available} rooms available</span></label></div>
                      <label className="text-sm"><span className="mb-1 block text-xs text-muted-foreground">Rate / night ($)</span><input aria-label={`${room.name} rate per night`} type="number" min="1" step="0.01" value={room.price} onChange={(event) => setRooms((current) => current.map((item) => item.id === room.id ? { ...item, price: Number(event.target.value) } : item))} onBlur={() => void updateRoom(room)} className="w-full rounded-md border border-border bg-input-background px-3 py-2" /></label>
                      <label className="text-sm"><span className="mb-1 block text-xs text-muted-foreground">Available rooms</span><input aria-label={`${room.name} available rooms`} type="number" min="0" step="1" value={room.available} onChange={(event) => setRooms((current) => current.map((item) => item.id === room.id ? { ...item, available: Number(event.target.value) } : item))} onBlur={() => void updateRoom(room)} className="w-full rounded-md border border-border bg-input-background px-3 py-2" /></label>
                    </div>
                  ))}
                </div>
                {rooms.length === 0 && <p className="mt-4 text-sm text-muted-foreground">Add at least one room type with availability to show your property to patients.</p>}
                <button onClick={() => void addRoom()} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-accent"><Plus size={16} /> Add room type</button>
              </div>
            )}

            {activeTab === "reservations" && (
              <div className="rounded-xl border border-border bg-card p-5 sm:p-7">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Stay requests</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Patient stay requests are not connected to this dashboard yet.</p>
                  </div>
                </div>
                <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">No stay requests are available yet.</p>
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

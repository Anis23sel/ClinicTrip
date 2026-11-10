"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Building2,
  Check,
  ClipboardList,
  Hotel,
  Link2,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";
import {
  adminDemoCookieName,
  adminDemoSessionKey,
} from "@/app/components/dashboard/admin/adminDemoAuth";

type Status = "Active" | "Pending" | "Suspended";
type DashboardTab = "overview" | "patients" | "clinics" | "accommodations" | "associations";
type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  status: Status;
};
type Clinic = {
  id: string;
  name: string;
  email: string;
  city: string;
  specialties: string;
  status: Status;
};
type Accommodation = {
  id: string;
  name: string;
  email: string;
  city: string;
  address: string;
  rooms: number;
  status: Status;
};
type Association = { clinicId: string; accommodationId: string };
type AdminData = {
  patients: Patient[];
  clinics: Clinic[];
  accommodations: Accommodation[];
  associations: Association[];
};
type EntityType = "clinic" | "accommodation";

const storageKey = "clinictrip-admin-dashboard-v1";
const supabase = createClient();

const initialData: AdminData = {
  patients: [
    { id: "PT-1001", name: "Olivia Carter", email: "olivia.carter@example.com", phone: "+1 202 555 0134", joined: "Oct 28, 2026", status: "Active" },
    { id: "PT-1002", name: "Noah Williams", email: "noah.williams@example.com", phone: "+44 20 7946 0211", joined: "Oct 26, 2026", status: "Active" },
    { id: "PT-1003", name: "Amelia Brown", email: "amelia.brown@example.com", phone: "+33 6 12 34 56 78", joined: "Oct 24, 2026", status: "Pending" },
    { id: "PT-1004", name: "Liam Johnson", email: "liam.johnson@example.com", phone: "+49 30 555 0198", joined: "Oct 21, 2026", status: "Suspended" },
  ],
  clinics: [
    { id: "CL-201", name: "Bosphorus Medical Center", email: "hello@bosphorus.example", city: "Istanbul", specialties: "Dentistry, Cosmetic surgery", status: "Active" },
    { id: "CL-202", name: "Anatolia Health Clinic", email: "contact@anatolia.example", city: "Istanbul", specialties: "Fertility, Dental", status: "Pending" },
    { id: "CL-203", name: "Aegean Wellness Hospital", email: "care@aegean.example", city: "Izmir", specialties: "Ophthalmology, Wellness", status: "Active" },
  ],
  accommodations: [
    { id: "AC-301", name: "The Bosphorus Stay", email: "partner@bosphorusstay.example", city: "Istanbul", address: "Cihangir, Beyoglu", rooms: 18, status: "Active" },
    { id: "AC-302", name: "Golden Horn Suites", email: "hello@goldenhorn.example", city: "Istanbul", address: "Balat, Fatih", rooms: 12, status: "Pending" },
    { id: "AC-303", name: "Olive Grove Hotel", email: "stay@olivegrove.example", city: "Izmir", address: "Alsancak, Konak", rooms: 26, status: "Active" },
  ],
  associations: [
    { clinicId: "CL-201", accommodationId: "AC-301" },
    { clinicId: "CL-202", accommodationId: "AC-302" },
    { clinicId: "CL-203", accommodationId: "AC-303" },
  ],
};

const tabs: { id: DashboardTab; label: string; icon: typeof Users }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "patients", label: "Patients", icon: Users },
  { id: "clinics", label: "Clinics", icon: Building2 },
  { id: "accommodations", label: "Accommodations", icon: Hotel },
  { id: "associations", label: "Clinic partnerships", icon: Link2 },
];

function isAdminData(value: unknown): value is AdminData {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return Array.isArray(data.patients)
    && Array.isArray(data.clinics)
    && Array.isArray(data.accommodations)
    && Array.isArray(data.associations);
}

function badgeClass(status: Status) {
  if (status === "Active") return "bg-success-background text-success-foreground";
  if (status === "Pending") return "bg-amber-100 text-amber-900";
  return "bg-error-background text-error-foreground";
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AdminData>(initialData);
  const [ready, setReady] = useState(false);
  const [accessReady, setAccessReady] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<{ type: EntityType; id?: string } | null>(null);
  const [clinicForLink, setClinicForLink] = useState("");
  const [accommodationForLink, setAccommodationForLink] = useState("");
  const [showPatientDetails, setShowPatientDetails] = useState<Patient | null>(null);

  useEffect(() => {
    let cancelled = false;
    const verifyAccess = async () => {
      try {
        if (window.sessionStorage.getItem(adminDemoSessionKey) === "true") {
          if (!cancelled) setAccessReady(true);
          return;
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        if (profileError) throw profileError;
        if (profile?.role !== "admin") {
          router.replace("/login");
          return;
        }
        if (!cancelled) setAccessReady(true);
      } catch (accessError) {
        console.error("Could not verify admin dashboard access:", accessError);
        if (!cancelled) {
          setError("We couldn't verify your admin access. Please sign in again.");
          router.replace("/login");
        }
      }
    };

    void verifyAccess();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (!isAdminData(parsed)) {
          throw new Error("Saved admin demo data is invalid. Clear this site's local storage to restore the sample dashboard.");
        }
        setData(parsed);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load admin demo data.");
    } finally {
      setReady(true);
    }
  }, []);

  const persist = (next: AdminData, message: string) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      setData(next);
      setError("");
      setNotice(message);
      return true;
    } catch {
      setError("Could not save your change in this browser. Check your storage settings and try again.");
      return false;
    }
  };

  const counts = useMemo(() => ({
    patients: data.patients.length,
    clinics: data.clinics.length,
    accommodations: data.accommodations.length,
    pending: [...data.patients, ...data.clinics, ...data.accommodations].filter((item) => item.status === "Pending").length,
  }), [data]);

  const signOut = async () => {
    if (window.sessionStorage.getItem(adminDemoSessionKey) === "true") {
      window.sessionStorage.removeItem(adminDemoSessionKey);
      document.cookie = `${adminDemoCookieName}=; Path=/; Max-Age=0; SameSite=Lax`;
      router.replace("/login");
      return;
    }

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(`Could not sign out: ${signOutError.message}`);
      return;
    }
    router.replace("/login");
  };

  const updateStatus = (type: "patient" | EntityType, id: string, status: Status) => {
    if (type === "patient") {
      persist({ ...data, patients: data.patients.map((item) => item.id === id ? { ...item, status } : item) }, `Patient status changed to ${status.toLowerCase()}.`);
    } else if (type === "clinic") {
      persist({ ...data, clinics: data.clinics.map((item) => item.id === id ? { ...item, status } : item) }, `Clinic status changed to ${status.toLowerCase()}.`);
    } else {
      persist({ ...data, accommodations: data.accommodations.map((item) => item.id === id ? { ...item, status } : item) }, `Accommodation status changed to ${status.toLowerCase()}.`);
    }
  };

  const saveEntity = (type: EntityType, values: Omit<Clinic, "id"> | Omit<Accommodation, "id">, id?: string) => {
    let saved = false;
    if (type === "clinic") {
      const clinic = values as Omit<Clinic, "id">;
      const clinics = id
        ? data.clinics.map((item) => item.id === id ? { ...item, ...clinic } : item)
        : [...data.clinics, { ...clinic, id: `CL-${Date.now()}` }];
      saved = persist({ ...data, clinics }, id ? "Clinic details updated." : "Clinic added to the demo directory.");
    } else {
      const accommodation = values as Omit<Accommodation, "id">;
      const accommodations = id
        ? data.accommodations.map((item) => item.id === id ? { ...item, ...accommodation } : item)
        : [...data.accommodations, { ...accommodation, id: `AC-${Date.now()}` }];
      saved = persist({ ...data, accommodations }, id ? "Accommodation details updated." : "Accommodation added to the demo directory.");
    }
    if (saved) {
      setEditing(null);
    }
  };

  const addAssociation = () => {
    if (!clinicForLink || !accommodationForLink) {
      setError("Choose both a clinic and an accommodation to create a partnership.");
      return;
    }
    if (data.associations.some((item) => item.clinicId === clinicForLink && item.accommodationId === accommodationForLink)) {
      setError("This clinic and accommodation are already associated.");
      return;
    }
    const saved = persist({
      ...data,
      associations: [...data.associations, { clinicId: clinicForLink, accommodationId: accommodationForLink }],
    }, "Clinic and accommodation linked.");
    if (saved) {
      setClinicForLink("");
      setAccommodationForLink("");
    }
  };

  const filteredPatients = data.patients.filter((patient) =>
    (statusFilter === "All" || patient.status === statusFilter)
    && `${patient.name} ${patient.email} ${patient.id}`.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredClinics = data.clinics.filter((clinic) =>
    (statusFilter === "All" || clinic.status === statusFilter)
    && `${clinic.name} ${clinic.email} ${clinic.city} ${clinic.id}`.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredAccommodations = data.accommodations.filter((accommodation) =>
    (statusFilter === "All" || accommodation.status === statusFilter)
    && `${accommodation.name} ${accommodation.email} ${accommodation.city} ${accommodation.id}`.toLowerCase().includes(search.toLowerCase()),
  );

  const activeCount = (items: { status: Status }[]) => items.filter((item) => item.status === "Active").length;
  const clinicName = (id: string) => data.clinics.find((item) => item.id === id)?.name ?? "Clinic removed";
  const accommodationName = (id: string) => data.accommodations.find((item) => item.id === id)?.name ?? "Accommodation removed";

  if (!ready || !accessReady) {
    return <main className="min-h-[60vh] px-4 py-16 text-center text-muted-foreground">Loading admin dashboard...</main>;
  }

  return (
    <main className="min-h-screen bg-accent/40 pb-12">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><ShieldCheck size={23} /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ClinicTrip administration</p>
              <h1 className="text-xl font-bold">Admin dashboard</h1>
            </div>
          </div>
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {error && <div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-lg bg-error-background p-3 text-sm text-error-foreground"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError("")}><X size={16} /></button></div>}
        {notice && <div role="status" className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-success-background p-3 text-sm text-success-foreground"><span>{notice}</span><button aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={16} /></button></div>}

        <div className="grid gap-6 lg:grid-cols-[245px_minmax(0,1fr)]">
          <aside className="h-fit rounded-xl border border-border bg-card p-3">
            <nav aria-label="Admin dashboard" className="flex gap-2 overflow-x-auto lg:flex-col">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setActiveTab(id); setSearch(""); setStatusFilter("All"); setNotice(""); }} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition lg:w-full ${activeTab === id ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                  <Icon size={18} /> {label}
                </button>
              ))}
            </nav>
            <div className="mt-5 hidden rounded-lg bg-accent p-4 lg:block">
              <p className="text-sm font-semibold">Admin access</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">This route requires an account with the admin role.</p>
            </div>
          </aside>

          <section className="min-w-0">
            {activeTab === "overview" && (
              <>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">Platform administration</p>
                  <h2 className="mt-1 text-2xl font-bold">Overview</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Patients" value={counts.patients} note={`${activeCount(data.patients)} active`} icon={Users} />
                  <StatCard label="Clinics" value={counts.clinics} note={`${activeCount(data.clinics)} active`} icon={Building2} />
                  <StatCard label="Accommodations" value={counts.accommodations} note={`${activeCount(data.accommodations)} active`} icon={Hotel} />
                  <StatCard label="Needs review" value={counts.pending} note="Pending approval" icon={ClipboardList} />
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="font-semibold">Review queue</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Approve pending partner listings or inspect new patient accounts.</p>
                    <div className="mt-4 space-y-3">
                      {[
                        ...data.clinics.filter((item) => item.status === "Pending").map((item) => ({ kind: "clinic" as const, id: item.id, name: item.name, location: item.city })),
                        ...data.accommodations.filter((item) => item.status === "Pending").map((item) => ({ kind: "accommodation" as const, id: item.id, name: item.name, location: item.city })),
                        ...data.patients.filter((item) => item.status === "Pending").map((item) => ({ kind: "patient" as const, id: item.id, name: item.name, location: item.email })),
                      ].map((item) => (
                        <div key={`${item.kind}-${item.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                          <div><p className="font-medium">{item.name}</p><p className="text-xs capitalize text-muted-foreground">{item.kind} · {item.location}</p></div>
                          <button onClick={() => updateStatus(item.kind, item.id, "Active")} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"><Check size={14} /> Approve</button>
                        </div>
                      ))}
                      {counts.pending === 0 && <p className="rounded-lg bg-accent p-4 text-sm text-muted-foreground">Nothing is waiting for review.</p>}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div><h3 className="font-semibold">Clinic partnerships</h3><p className="mt-1 text-sm text-muted-foreground">Clinic and accommodation links</p></div>
                      <button onClick={() => setActiveTab("associations")} className="text-sm font-medium text-primary hover:underline">Manage</button>
                    </div>
                    <div className="mt-4 space-y-3">
                      {data.associations.slice(0, 4).map((association) => (
                        <div key={`${association.clinicId}-${association.accommodationId}`} className="flex items-center gap-3 rounded-lg bg-accent p-3">
                          <div className="rounded-lg bg-card p-2 text-primary"><Link2 size={16} /></div>
                          <div className="min-w-0"><p className="truncate text-sm font-medium">{clinicName(association.clinicId)}</p><p className="truncate text-xs text-muted-foreground">{accommodationName(association.accommodationId)}</p></div>
                        </div>
                      ))}
                      {data.associations.length === 0 && <p className="text-sm text-muted-foreground">No clinic partnerships yet.</p>}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "patients" && (
              <DirectoryHeader title="Patients" description="Review patient profiles and manage account status." search={search} onSearch={setSearch} statusFilter={statusFilter} onStatusFilter={setStatusFilter}>
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="hidden grid-cols-[1.4fr_1.5fr_1fr_125px_130px] gap-3 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
                    <span>Patient</span><span>Email</span><span>Joined</span><span>Status</span><span>Actions</span>
                  </div>
                  {filteredPatients.map((patient) => (
                    <div key={patient.id} className="grid gap-3 border-b border-border p-4 last:border-b-0 md:grid-cols-[1.4fr_1.5fr_1fr_125px_130px] md:items-center md:px-5">
                      <div><p className="font-medium">{patient.name}</p><p className="text-xs text-muted-foreground">{patient.id} · {patient.phone}</p></div>
                      <span className="break-all text-sm text-muted-foreground">{patient.email}</span>
                      <span className="text-sm text-muted-foreground">{patient.joined}</span>
                      <StatusBadge status={patient.status} />
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setShowPatientDetails(patient)} className="rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-accent">Details</button>
                        <StatusMenu status={patient.status} onSelect={(status) => updateStatus("patient", patient.id, status)} />
                      </div>
                    </div>
                  ))}
                  {filteredPatients.length === 0 && <EmptyState text="No patients match your search." />}
                </div>
              </DirectoryHeader>
            )}

            {activeTab === "clinics" && (
              <DirectoryHeader title="Clinics" description="Review clinic listings, contact details, and account status." search={search} onSearch={setSearch} statusFilter={statusFilter} onStatusFilter={setStatusFilter} action={<button onClick={() => setEditing({ type: "clinic" })} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={16} /> Add clinic</button>}>
                <div className="grid gap-4 xl:grid-cols-2">
                  {filteredClinics.map((clinic) => (
                    <article key={clinic.id} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3"><div className="rounded-lg bg-accent p-2.5 text-primary"><Building2 size={20} /></div><div className="min-w-0"><h3 className="truncate font-semibold">{clinic.name}</h3><p className="text-xs text-muted-foreground">{clinic.id}</p></div></div>
                        <StatusBadge status={clinic.status} />
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <p className="break-all">{clinic.email}</p><p className="flex items-center gap-1.5"><MapPin size={14} /> {clinic.city}</p><p>{clinic.specialties}</p>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                        <p className="text-xs text-muted-foreground">{data.associations.filter((item) => item.clinicId === clinic.id).length} linked accommodations</p>
                        <div className="flex gap-2">
                          <button aria-label={`Edit ${clinic.name}`} onClick={() => setEditing({ type: "clinic", id: clinic.id })} className="rounded-md border border-border p-2 hover:bg-accent"><Pencil size={15} /></button>
                          <StatusMenu status={clinic.status} onSelect={(status) => updateStatus("clinic", clinic.id, status)} />
                        </div>
                      </div>
                    </article>
                  ))}
                  {filteredClinics.length === 0 && <EmptyState text="No clinics match your search." />}
                </div>
              </DirectoryHeader>
            )}

            {activeTab === "accommodations" && (
              <DirectoryHeader title="Accommodations" description="Manage accommodation partners and their listing status." search={search} onSearch={setSearch} statusFilter={statusFilter} onStatusFilter={setStatusFilter} action={<button onClick={() => setEditing({ type: "accommodation" })} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={16} /> Add accommodation</button>}>
                <div className="grid gap-4 xl:grid-cols-2">
                  {filteredAccommodations.map((accommodation) => (
                    <article key={accommodation.id} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3"><div className="rounded-lg bg-accent p-2.5 text-primary"><Hotel size={20} /></div><div className="min-w-0"><h3 className="truncate font-semibold">{accommodation.name}</h3><p className="text-xs text-muted-foreground">{accommodation.id}</p></div></div>
                        <StatusBadge status={accommodation.status} />
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <p className="break-all">{accommodation.email}</p><p className="flex items-center gap-1.5"><MapPin size={14} /> {accommodation.address}, {accommodation.city}</p><p>{accommodation.rooms} rooms</p>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                        <p className="text-xs text-muted-foreground">{data.associations.filter((item) => item.accommodationId === accommodation.id).length} linked clinics</p>
                        <div className="flex gap-2">
                          <button aria-label={`Edit ${accommodation.name}`} onClick={() => setEditing({ type: "accommodation", id: accommodation.id })} className="rounded-md border border-border p-2 hover:bg-accent"><Pencil size={15} /></button>
                          <StatusMenu status={accommodation.status} onSelect={(status) => updateStatus("accommodation", accommodation.id, status)} />
                        </div>
                      </div>
                    </article>
                  ))}
                  {filteredAccommodations.length === 0 && <EmptyState text="No accommodations match your search." />}
                </div>
              </DirectoryHeader>
            )}

            {activeTab === "associations" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">Clinic partnerships</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Associate clinics with one or more accommodations and remove links when they are no longer relevant.</p>
                </div>
                <div className="mb-6 rounded-xl border border-border bg-card p-5">
                  <h3 className="font-semibold">Create a partnership</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Only active clinics and accommodations are available to associate.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <label className="text-sm font-medium">Clinic
                      <select value={clinicForLink} onChange={(event) => setClinicForLink(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-input-background px-3 py-3">
                        <option value="">Select a clinic</option>
                        {data.clinics.filter((item) => item.status === "Active").map((clinic) => <option key={clinic.id} value={clinic.id}>{clinic.name} — {clinic.city}</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-medium">Accommodation
                      <select value={accommodationForLink} onChange={(event) => setAccommodationForLink(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-input-background px-3 py-3">
                        <option value="">Select an accommodation</option>
                        {data.accommodations.filter((item) => item.status === "Active").map((accommodation) => <option key={accommodation.id} value={accommodation.id}>{accommodation.name} — {accommodation.city}</option>)}
                      </select>
                    </label>
                    <button onClick={addAssociation} className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={16} /> Associate</button>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold">Current partnerships</h3><p className="mt-1 text-sm text-muted-foreground">{data.associations.length} association{data.associations.length === 1 ? "" : "s"}</p></div><Link2 className="text-primary" size={20} /></div>
                  <div className="space-y-3">
                    {data.associations.map((association) => (
                      <div key={`${association.clinicId}-${association.accommodationId}`} className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_auto_1fr_auto] md:items-center">
                        <div><p className="text-xs text-muted-foreground">Clinic</p><p className="font-medium">{clinicName(association.clinicId)}</p></div>
                        <Link2 size={18} className="hidden text-muted-foreground md:block" />
                        <div><p className="text-xs text-muted-foreground">Accommodation</p><p className="font-medium">{accommodationName(association.accommodationId)}</p></div>
                        <button onClick={() => persist({ ...data, associations: data.associations.filter((item) => item.clinicId !== association.clinicId || item.accommodationId !== association.accommodationId) }, "Partnership removed.")} className="rounded-md border border-border px-3 py-2 text-sm hover:border-error/40 hover:text-error">Remove</button>
                      </div>
                    ))}
                    {data.associations.length === 0 && <EmptyState text="No partnerships yet. Use the form above to associate a clinic and accommodation." />}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {editing && (
        <EntityDialog
          type={editing.type}
          entity={editing.id ? editing.type === "clinic" ? data.clinics.find((item) => item.id === editing.id) : data.accommodations.find((item) => item.id === editing.id) : undefined}
          onClose={() => setEditing(null)}
          onSave={(values) => saveEntity(editing.type, values, editing.id)}
        />
      )}
      {showPatientDetails && (
        <Dialog title="Patient details" onClose={() => setShowPatientDetails(null)}>
          <div className="space-y-3 text-sm">
            <DetailRow label="Name" value={showPatientDetails.name} />
            <DetailRow label="Patient ID" value={showPatientDetails.id} />
            <DetailRow label="Email" value={showPatientDetails.email} />
            <DetailRow label="Phone" value={showPatientDetails.phone} />
            <DetailRow label="Joined" value={showPatientDetails.joined} />
            <div className="flex items-center justify-between border-t border-border pt-3"><span className="text-muted-foreground">Status</span><StatusBadge status={showPatientDetails.status} /></div>
          </div>
        </Dialog>
      )}
    </main>
  );
}

function StatCard({ label, value, note, icon: Icon }: { label: string; value: number; note: string; icon: typeof Users }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between text-muted-foreground"><span className="text-sm">{label}</span><Icon size={18} /></div>
      <p className="mt-4 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(status)}`}>{status}</span>;
}

function StatusMenu({ status, onSelect }: { status: Status; onSelect: (status: Status) => void }) {
  const nextStatus: Status = status === "Active" ? "Suspended" : "Active";
  return (
    <button onClick={() => onSelect(nextStatus)} aria-label={`${status === "Active" ? "Suspend" : "Activate"} account`} className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-accent">
      {status === "Active" ? "Suspend" : "Activate"}
    </button>
  );
}

function DirectoryHeader({ title, description, search, onSearch, statusFilter, onStatusFilter, action, children }: {
  title: string;
  description: string;
  search: string;
  onSearch: (value: string) => void;
  statusFilter: "All" | Status;
  onStatusFilter: (value: "All" | Status) => void;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="text-2xl font-bold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>
        {action}
      </div>
      <div className="mb-4 flex flex-wrap gap-3">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Search {title.toLowerCase()}</span>
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}...`} className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 outline-none focus:ring-2 focus:ring-ring" />
        </label>
        <select aria-label="Filter by status" value={statusFilter} onChange={(event) => onStatusFilter(event.target.value as "All" | Status)} className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
          <option value="All">All statuses</option><option value="Active">Active</option><option value="Pending">Pending</option><option value="Suspended">Suspended</option>
        </select>
      </div>
      {children}
    </>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">{text}</p>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b border-border pb-3 last:border-0"><span className="text-muted-foreground">{label}</span><span className="text-right font-medium">{value}</span></div>;
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between"><h2 id="admin-dialog-title" className="text-xl font-bold">{title}</h2><button onClick={onClose} aria-label="Close dialog" className="rounded-md p-1 hover:bg-accent"><X size={19} /></button></div>
        {children}
      </section>
    </div>
  );
}

function EntityDialog({ type, entity, onClose, onSave }: {
  type: EntityType;
  entity?: Clinic | Accommodation;
  onClose: () => void;
  onSave: (values: Omit<Clinic, "id"> | Omit<Accommodation, "id">) => void;
}) {
  const isClinic = type === "clinic";
  const clinic = isClinic && entity ? entity as Clinic : undefined;
  const accommodation = !isClinic && entity ? entity as Accommodation : undefined;
  const [name, setName] = useState(clinic?.name ?? accommodation?.name ?? "");
  const [email, setEmail] = useState(clinic?.email ?? accommodation?.email ?? "");
  const [city, setCity] = useState(clinic?.city ?? accommodation?.city ?? "");
  const [status, setStatus] = useState<Status>(entity?.status ?? "Pending");
  const [specialties, setSpecialties] = useState(clinic?.specialties ?? "");
  const [address, setAddress] = useState(accommodation?.address ?? "");
  const [rooms, setRooms] = useState(accommodation?.rooms ?? 1);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isClinic) onSave({ name: name.trim(), email: email.trim(), city: city.trim(), specialties: specialties.trim(), status });
    else onSave({ name: name.trim(), email: email.trim(), city: city.trim(), address: address.trim(), rooms, status });
  };

  return (
    <Dialog title={`${entity ? "Edit" : "Add"} ${isClinic ? "clinic" : "accommodation"}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label={isClinic ? "Clinic name" : "Accommodation name"} value={name} onChange={setName} required />
        <FormField label="Contact email" value={email} onChange={setEmail} type="email" required />
        <FormField label="City" value={city} onChange={setCity} required />
        {isClinic ? <FormField label="Specialties" value={specialties} onChange={setSpecialties} required /> : (
          <>
            <FormField label="Address" value={address} onChange={setAddress} required />
            <FormField label="Room count" value={String(rooms)} onChange={(value) => setRooms(Math.max(0, Number(value)))} type="number" min="0" required />
          </>
        )}
        <label className="block text-sm font-medium">Status
          <select value={status} onChange={(event) => setStatus(event.target.value as Status)} className="mt-2 w-full rounded-lg border border-border bg-input-background px-3 py-3">
            <option>Pending</option><option>Active</option><option>Suspended</option>
          </select>
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-accent">Cancel</button>
          <button type="submit" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Save</button>
        </div>
      </form>
    </Dialog>
  );
}

function FormField({ label, value, onChange, required = false, type = "text", min }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  min?: string;
}) {
  return (
    <label className="block text-sm font-medium">{label}
      <input type={type} min={min} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-input-background px-3 py-3 outline-none focus:ring-2 focus:ring-ring" />
    </label>
  );
}

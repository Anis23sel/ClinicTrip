"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/app/utils/supabase/client";
import PatientDocuments from "@/app/components/dashboard/patient/PatientDocuments";
import PatientProfile from "@/app/components/dashboard/patient/PatientProfile";
import PatientRequests from "@/app/components/dashboard/patient/PatientRequests";
import PatientInvoices from "@/app/components/dashboard/patient/PatientInvoices";
import PatientBookingOverview from "@/app/components/dashboard/patient/PatientBookingOverview";
import PatientMessages from "@/app/components/dashboard/patient/PatientMessages";
import PatientRequestDetails from "@/app/components/dashboard/patient/PatientRequestDetails";
// Importe ton futur composant de détails ici (crée-le dans le même dossier)
// import PatientRequestDetails from "@/app/components/dashboard/patient/PatientRequestDetails";

type Tab = "overview" | "consultations" | "invoices" | "profile" | "documents" | "messages" | "details";
type Profile = { firstName: string; lastName: string; email: string; gender: string; phone: string };
const validTabs: Tab[] = ["overview", "consultations", "invoices", "profile", "documents", "messages", "details"];

export default function PatientDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const requestId = searchParams.get("requestId");
  const detailsId = searchParams.get("id");

  const activeTab: Tab = validTabs.includes(tabParam as Tab)
    ? (tabParam as Tab)
    : requestId ? "messages" : "overview";

  const [profile, setProfile] = useState<Profile>({ firstName: "", lastName: "", email: "", gender: "", phone: "" });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      setProfileLoading(true);
      setProfileError("");
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("Please sign in to view your profile.");
        const { data: profileRow, error: profileError } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
        if (profileError || !profileRow) throw new Error("We could not find your profile.");
        const { data: patient, error: patientError } = await supabase.from("patients").select("first_name, last_name, gender, phone").eq("profile_id", profileRow.id).maybeSingle();
        if (patientError) throw patientError;
        if (!patient) throw new Error("No patient record is linked to your account.");
        if (!cancelled) setProfile({ firstName: patient.first_name ?? "", lastName: patient.last_name ?? "", email: user.email ?? "", gender: patient.gender ?? "", phone: patient.phone ?? "" });
      } catch (error) {
        if (!cancelled) setProfileError(error instanceof Error ? error.message : "We could not load your patient information.");
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };
    void loadProfile();
    return () => { cancelled = true; };
  }, [supabase]);

  const savePatientProfile = async (next: Profile) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("Please sign in to update your profile.");
    const { data: profileRow, error: profileError } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
    if (profileError || !profileRow) throw new Error("We could not find your patient profile.");
    const { error } = await supabase.from("patients").update({ first_name: next.firstName.trim(), last_name: next.lastName.trim(), gender: next.gender || null, phone: next.phone || null }).eq("profile_id", profileRow.id);
    if (error) throw new Error("We could not save your profile. Please try again.");
    setProfile({ ...next, email: user.email ?? next.email });
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold">Patient dashboard</h1>
        
        {activeTab === "overview" && <PatientBookingOverview />}
        
        {activeTab === "consultations" && (
          <PatientRequests 
            onOpenMessages={(id) => router.push(`/dashboard/patient?tab=messages&requestId=${encodeURIComponent(id)}`)}
            onViewDetails={(id) => router.push(`/dashboard/patient?tab=details&id=${encodeURIComponent(id)}`)}
          />
        )}

        {activeTab === "messages" && <PatientMessages initialRequestId={requestId} />}
        
        {activeTab === "invoices" && <PatientInvoices />}
        
        {activeTab === "documents" && <PatientDocuments />}
        
        {activeTab === "details" && (
          <div>
            <button 
              onClick={() => router.push("/dashboard/patient?tab=consultations")} 
              className="mb-4 text-sm text-primary underline hover:opacity-80"
            >
              &larr; Back to consultations
            </button>
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <PatientRequestDetails requestId={detailsId} />
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          profileLoading ? (
            <p className="text-muted-foreground">Loading your profile...</p>
          ) : profileError ? (
            <p role="alert" className="text-destructive">{profileError}</p>
          ) : (
            <PatientProfile profile={profile} onChange={setProfile} onSave={savePatientProfile} />
          )
        )}
      </div>
    </main>
  );
}

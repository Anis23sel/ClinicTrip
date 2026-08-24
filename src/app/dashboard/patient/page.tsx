"use client";

import { useEffect, useState } from "react";
import { Calendar, FileText, User } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";
import PatientDocuments from "../../components/dashboard/patient/PatientDocuments";
import PatientProfile from "../../components/dashboard/patient/PatientProfile";
import PatientRequests from "@/app/components/dashboard/patient/PatientRequests";

type Tab = "requests" | "profile" | "documents";

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  phone: string;
};

const tabs = [
  { id: "requests" as const, label: "My requests", icon: Calendar },
  { id: "profile" as const, label: "Profile", icon: User },
  { id: "documents" as const, label: "Documents", icon: FileText },
];

export default function PatientDashboard() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<Tab>("requests");

  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    phone: "",
  });

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    const loadPatientProfile = async () => {
      setProfileLoading(true);
      setProfileError("");

      try {
        // 1. Get currently signed-in user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          setProfileError("Please sign in to view your profile.");
          return;
        }

        // 2. Get the profile belonging to this auth user
        const {
          data: profileRow,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (profileError || !profileRow) {
          console.error("Failed to load profile:", profileError);
          setProfileError("We could not find your profile.");
          return;
        }

        // 3. Get patient using profiles.id
        const {
          data: patient,
          error: patientError,
        } = await supabase
          .from("patients")
          .select(
            "first_name, last_name, gender, phone"
          )
          .eq("profile_id", profileRow.id)
          .maybeSingle();

        if (patientError) {
          console.error("Failed to load patient:", patientError);
          setProfileError(
            "We could not load your patient information."
          );
          return;
        }

        if (!patient) {
          setProfileError(
            "No patient record is linked to your account."
          );
          return;
        }

        // 4. Put database data into React state
        setProfile({
          firstName: patient.first_name ?? "",
          lastName: patient.last_name ?? "",
          email: user.email ?? "",
          gender: patient.gender ?? "",
          phone: patient.phone ?? "",
        });
      } catch (error) {
        console.error("Failed to load patient profile:", error);

        setProfileError(
          error instanceof Error
            ? error.message
            : "We could not load your patient information."
        );
      } finally {
        setProfileLoading(false);
      }
    };

    loadPatientProfile();
  }, []);

  const savePatientProfile = async (nextProfile: Profile) => {
    // 1. Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      throw new Error("Please sign in to update your profile.");
    }

    // 2. Get profiles.id
    const {
      data: profileRow,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profileRow) {
      throw new Error(
        "We could not find your patient profile."
      );
    }

    // 3. Update patient's row
    const { error: updateError } = await supabase
      .from("patients")
      .update({
        first_name: nextProfile.firstName.trim(),
        last_name: nextProfile.lastName.trim(),
        gender: nextProfile.gender || null,
        phone: nextProfile.phone || null,
      })
      .eq("profile_id", profileRow.id);

    if (updateError) {
      console.error("Failed to update patient:", updateError);
      throw new Error(
        "We could not save your profile. Please try again."
      );
    }

    // 4. Update local state immediately
    setProfile({
      ...nextProfile,
      email: user.email ?? nextProfile.email,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary px-4 py-8 text-primary-foreground">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold">
            Patient Dashboard
          </h1>

          <p className="mt-2 text-primary-foreground/80">
            Welcome back
            {[profile.firstName, profile.lastName].filter(Boolean).length > 0
              ? `, ${[profile.firstName, profile.lastName].filter(Boolean).join(" ")}`
              : ""}!
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 shrink-0">
            <div className="sticky top-24 rounded-lg border border-border bg-card p-4">
              <nav className="space-y-2">
                {tabs.map(
                  ({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTab(id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                        activeTab === id
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-accent"
                      }`}
                    >
                      <Icon size={20} />
                      {label}
                    </button>
                  )
                )}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {activeTab === "requests" && (
              <PatientRequests />
            )}

            {activeTab === "profile" && (
              <>
                {profileLoading && (
                  <p className="text-muted-foreground">
                    Loading your profile...
                  </p>
                )}

                {!profileLoading && profileError && (
                  <p
                    role="alert"
                    className="text-destructive"
                  >
                    {profileError}
                  </p>
                )}

                {!profileLoading && !profileError && (
                  <PatientProfile
                    profile={profile}
                    onChange={setProfile}
                    onSave={savePatientProfile}
                  />
                )}
              </>
            )}

            {activeTab === "documents" && (
              <PatientDocuments />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
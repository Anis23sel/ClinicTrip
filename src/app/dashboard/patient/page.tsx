"use client";

import { useState } from "react";
import { Calendar, FileText, User } from "lucide-react";
import PatientDocuments from "../../components/dashboard/patient/PatientDocuments";
import PatientProfile from "../../components/dashboard/patient/PatientProfile";
import PatientRequests from "../../components/dashboard/patient/PatientRequests";

type Tab = "requests" | "profile" | "documents";

type Profile = {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  medicalHistory: string;
};

const tabs = [
  { id: "requests" as const, label: "My requests", icon: Calendar },
  { id: "profile" as const, label: "Profile", icon: User },
  { id: "documents" as const, label: "Documents", icon: FileText },
];

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("requests");
  const [profile, setProfile] = useState<Profile>({
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 234 567 8900",
    dateOfBirth: "1990-05-15",
    address: "123 Main St, New York, NY",
    medicalHistory: "",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary px-4 py-8 text-primary-foreground">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold">Patient Dashboard</h1>
          <p className="mt-2 text-primary-foreground/80">Welcome back, {profile.name}!</p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-8">
          <aside className="w-64 shrink-0">
            <div className="sticky top-24 rounded-lg border border-border bg-card p-4">
              <nav className="space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)} className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${activeTab === id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"}`}>
                    <Icon size={20} />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {activeTab === "requests" && <PatientRequests />}
            {activeTab === "profile" && <PatientProfile profile={profile} onChange={setProfile} />}
            {activeTab === "documents" && <PatientDocuments />}
          </div>
        </div>
      </main>
    </div>
  );
}

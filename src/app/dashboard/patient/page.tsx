"use client";
import { useState } from "react";
import Link from "next/link";
import { Calendar, FileText, User, Upload } from "lucide-react";
import { mockrequests, mockDocuments } from "../../components/mock/MockData";
import BookingCard from "../../components/dashboard/BookingCard";

type Tab = "requests" | "profile" | "documents";

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("requests");
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 234 567 8900",
    dateOfBirth: "1990-05-15",
    address: "123 Main St, New York, NY",
    medicalHistory: "",
  });

  

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Patient Dashboard</h1>
          <p className="text-primary-foreground/80 mt-2">Welcome back, {profile.name}!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-24">
              <nav className="space-y-2">
                {[
                  { id: "requests" as Tab, label: "My requests", icon: Calendar },
                  { id: "profile" as Tab, label: "Profile", icon: User },
                  { id: "documents" as Tab, label: "Documents", icon: FileText },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground"}`}>
                      <Icon size={20} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="flex-1">
            {activeTab === "requests" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">My Requests</h2>
                  <Link href="/search" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">New Request</Link>
                </div>
                <div className="space-y-4">
                  {mockrequests.map((request) => (
                    <BookingCard key={request.id} booking={request} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
                <div className="bg-card rounded-lg border border-border p-6">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { label: "Full Name", key: "name", type: "text" },
                        { label: "Email", key: "email", type: "email" },
                        { label: "Phone", key: "phone", type: "tel" },
                        { label: "Date of Birth", key: "dateOfBirth", type: "date" },
                      ].map(({ label, key, type }) => (
                        <div key={key}>
                          <label className="block mb-2 font-medium">{label}</label>
                          <input type={type} value={profile[key as keyof typeof profile] as string} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block mb-2 font-medium">Address</label>
                      <input type="text" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block mb-2 font-medium">Medical History</label>
                      <textarea value={profile.medicalHistory} onChange={(e) => setProfile({ ...profile, medicalHistory: e.target.value })} rows={4} placeholder="Enter any relevant medical history..." className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">Save Changes</button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Medical Documents</h2>
                <div className="bg-card rounded-lg border border-border p-6 mb-6">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
                    <h3 className="font-semibold mb-2">Upload Documents</h3>
                    <p className="text-muted-foreground mb-4">Upload medical records, lab results, or prescriptions</p>
                    <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">Choose Files</button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold mb-4">Uploaded Documents</h3>
                  {mockDocuments.map((doc) => (
                    <div key={doc.id} className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="text-primary" size={24} />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">{doc.uploadDate}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm border border-border rounded hover:bg-accent transition-colors">View</button>
                        <button className="px-3 py-1 text-sm text-destructive hover:bg-destructive/10 rounded transition-colors">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
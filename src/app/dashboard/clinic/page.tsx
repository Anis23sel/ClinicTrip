'use client';

import { useState } from 'react';
import { Building, Calendar, Home, Stethoscope, Users } from 'lucide-react';
import ClinicAccommodations from '../../components/dashboard/clinic/ClinicAccommodations';
import ClinicBookings from '../../components/dashboard/clinic/ClinicBookings';
import ClinicDoctors from '../../components/dashboard/clinic/ClinicDoctors';
import ClinicProcedures from '../../components/dashboard/clinic/ClinicProcedures';
import ClinicProfile from '../../components/dashboard/clinic/ClinicProfile';

type Tab = 'profile' | 'doctors' | 'procedures' | 'accommodations' | 'bookings';

const tabs = [
  { id: 'profile' as const, label: 'Clinic Profile', icon: Building },
  { id: 'doctors' as const, label: 'Doctors', icon: Users },
  { id: 'procedures' as const, label: 'Procedures', icon: Stethoscope },
  { id: 'accommodations' as const, label: 'Accommodations', icon: Home },
  { id: 'bookings' as const, label: 'Bookings', icon: Calendar },
];

export default function ClinicDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary px-4 py-8 text-primary-foreground">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold">Clinic Dashboard</h1>
          <p className="mt-2 text-primary-foreground/80">Istanbul Medical Center</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-8">
          <aside className="w-64 shrink-0">
            <div className="sticky top-24 rounded-lg border border-border bg-card p-4">
              <nav className="space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)} className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${activeTab === id ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'}`}>
                    <Icon size={20} />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {activeTab === 'profile' && <ClinicProfile />}
            {activeTab === 'doctors' && <ClinicDoctors />}
            {activeTab === 'procedures' && <ClinicProcedures />}
            {activeTab === 'accommodations' && <ClinicAccommodations />}
            {activeTab === 'bookings' && <ClinicBookings />}
          </div>
        </div>
      </main>
    </div>
  );
}

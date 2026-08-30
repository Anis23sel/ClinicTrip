'use client';

import { useEffect, useState } from 'react';
import { Building, Calendar, Home, Stethoscope, Users } from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client';
import ClinicAccommodations from '../../components/dashboard/clinic/ClinicAccommodations';
import ClinicBookings from '@/app/components/dashboard/clinic/ClinicBookings';
import ClinicDoctors from '../../components/dashboard/clinic/ClinicDoctors';
import ClinicProcedures from '../../components/dashboard/clinic/ClinicProcedures';
import ClinicProfile from '../../components/dashboard/clinic/ClinicProfile';

type Tab = 'profile' | 'doctors' | 'procedures' | 'accommodations' | 'bookings';

export type ClinicRecord = {
  id: string;
  clinic_name: string;
  address: string | null;
  phone: string | null;
  state: string | null;
  website: string | null;
  country: string | null;
  city_id: string | null;
  email: string | null;
};

export type ClinicProcedureRecord = {
  id: string;
  procedure_id: string;
  starting_price: number | string | null;
  procedure: { name: string; description: string | null; duration_minutes: number | null } | null;
};

export type MedicalProcedureOption = {
  id: string;
  name: string;
};

export type ClinicBookingRecord = {
  id: string;
  patientName: string;
  startDate: string | null;
  endDate: string | null;
};

const supabase = createClient();

const tabs = [
  { id: 'profile' as const, label: 'Clinic Profile', icon: Building },
  { id: 'doctors' as const, label: 'Doctors', icon: Users },
  { id: 'procedures' as const, label: 'Procedures', icon: Stethoscope },
  { id: 'accommodations' as const, label: 'Accommodations', icon: Home },
  { id: 'bookings' as const, label: 'Consultations', icon: Calendar },
];

export default function ClinicDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [clinic, setClinic] = useState<ClinicRecord | null>(null);
  const [procedures, setProcedures] = useState<ClinicProcedureRecord[]>([]);
  const [medicalProcedures, setMedicalProcedures] = useState<MedicalProcedureOption[]>([]);
  const [bookings, setBookings] = useState<ClinicBookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadClinicDashboard = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error('Please sign in to view your clinic dashboard.');

      const { data: profile, error: profileError } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (profileError || !profile) throw profileError || new Error('Your clinic profile was not found.');

      const { data: clinicRow, error: clinicError } = await supabase
        .from('clinics')
        .select('id, clinic_name, address, phone, website, country, city_id, email')
        .eq('profile_id', profile.id)
        .maybeSingle();
      if (clinicError || !clinicRow) throw clinicError || new Error('No clinic is linked to your account.');
      setClinic(clinicRow as ClinicRecord);

      const [{ data: procedureRows, error: procedureError }, { data: requestRows, error: requestError }, { data: medicalProcedureRows, error: procedureCatalogError }] = await Promise.all([
        supabase.from('clinic_procedures').select('id, procedure_id, starting_price').eq('clinic_id', clinicRow.id),
        supabase.from('Patient_request').select('id, created_at, id_patient, id_clinic, start_date, end_date').eq('id_clinic', clinicRow.id).order('created_at', { ascending: false }),
        supabase.from('medical_procedure').select('id, name').order('name'),
      ]);
      if (procedureError) console.error('Failed to load clinic procedures:', procedureError);
      if (requestError) console.error('Failed to load clinic consultations:', requestError);
      if (procedureCatalogError) console.error('Failed to load procedure options:', procedureCatalogError);
      setMedicalProcedures((medicalProcedureRows || []).map((procedure) => ({ id: String(procedure.id), name: procedure.name })));

      const procedureIds = [...new Set((procedureRows || []).map((procedure) => procedure.procedure_id))];
      const { data: medicalProcedures, error: medicalProcedureError } = procedureIds.length
        ? await supabase.from('medical_procedure').select('id, name, description, duration_minutes').in('id', procedureIds)
        : { data: [], error: null };
      if (medicalProcedureError) console.error('Failed to load medical procedures:', medicalProcedureError);
      const medicalProcedureById = new Map((medicalProcedures || []).map((procedure) => [String(procedure.id), procedure]));
      setProcedures((procedureRows || []).map((procedure) => ({
        ...procedure,
        procedure: medicalProcedureById.get(String(procedure.procedure_id)) || null,
      })) as ClinicProcedureRecord[]);
      const patientIds = [...new Set((requestRows || []).map((request) => request.id_patient))];
      const { data: patients, error: patientsError } = patientIds.length
        ? await supabase.from('patients').select('id, first_name, last_name').in('id', patientIds)
        : { data: [], error: null };
      if (patientsError) console.error('Failed to load booking patients:', patientsError);
      const patientNames = new Map((patients || []).map((patient) => [String(patient.id), [patient.first_name, patient.last_name].filter(Boolean).join(' ')]));
      setBookings((requestRows || []).map((request) => ({
        id: String(request.id),
        patientName: patientNames.get(String(request.id_patient)) || 'Patient',
        startDate: request.start_date,
        endDate: request.end_date,
      })));
    };

    loadClinicDashboard().catch((loadError) => {
      console.error('Failed to load clinic dashboard:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'We could not load your clinic dashboard.');
    }).finally(() => setLoading(false));
  }, []);

  const updateClinic = async (nextClinic: ClinicRecord) => {
    if (!clinic) return;
    const { error: updateError } = await supabase.from('clinics').update({
      clinic_name: nextClinic.clinic_name,
      address: nextClinic.address,
      phone: nextClinic.phone,
      state: nextClinic.state,
      website: nextClinic.website,
      country: nextClinic.country,
      email: nextClinic.email,
    }).eq('id', clinic.id);
    if (updateError) throw updateError;
    setClinic(nextClinic);
  };

  const addProcedure = async (procedureId: string, startingPrice: number) => {
    if (!clinic) return;

    const { data: procedure, error: insertError } = await supabase
      .from('clinic_procedures')
      .insert({ clinic_id: clinic.id, procedure_id: procedureId, starting_price: startingPrice })
      .select('id, procedure_id, starting_price')
      .single();
    if (insertError || !procedure) throw insertError || new Error('The procedure could not be added.');

    const procedureDetails = medicalProcedures.find((option) => option.id === String(procedure.procedure_id));
    setProcedures((current) => [...current, {
      id: String(procedure.id),
      procedure_id: String(procedure.procedure_id),
      starting_price: procedure.starting_price,
      procedure: procedureDetails ? { name: procedureDetails.name, description: null, duration_minutes: null } : null,
    }]);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary px-4 py-8 text-primary-foreground">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold">Clinic Dashboard</h1>
          <p className="mt-2 text-primary-foreground/80">{clinic?.clinic_name || 'Loading clinic...'}</p>
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
            {loading && <p className="text-muted-foreground">Loading your clinic data...</p>}
            {!loading && error && <p role="alert" className="text-destructive">{error}</p>}
            {!loading && !error && activeTab === 'profile' && clinic && <ClinicProfile clinic={clinic} onSave={updateClinic} />}
            {activeTab === 'doctors' && <ClinicDoctors />}
            {!loading && !error && activeTab === 'procedures' && <ClinicProcedures procedures={procedures} procedureOptions={medicalProcedures} onAddProcedure={addProcedure} />}
            {activeTab === 'accommodations' && <ClinicAccommodations />}
            {!loading && !error && activeTab === 'bookings' && clinic && <ClinicBookings clinicId={clinic.id} />}
          </div>
        </div>
      </main>
    </div>
  );
}

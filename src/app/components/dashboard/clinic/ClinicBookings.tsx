import { useEffect, useState } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client';

type Booking = { id: string; patientName: string; startDate: string | null; endDate: string | null };
const supabase = createClient();

export default function ClinicBookings({ clinicId }: { clinicId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      const { data: rows, error: requestError } = await supabase
        .from('Patient_request')
        .select('id, id_patient, id_clinic, start_date, end_date')
        .eq('id_clinic', clinicId)
        .order('created_at', { ascending: false });
      if (requestError) throw requestError;

      const patientIds = [...new Set((rows || []).map((row) => row.id_patient))];
      const { data: patients, error: patientError } = patientIds.length
        ? await supabase.from('patients').select('id, first_name, last_name').in('id', patientIds)
        : { data: [], error: null };
      if (patientError) throw patientError;

      const names = new Map((patients || []).map((patient) => [String(patient.id), [patient.first_name, patient.last_name].filter(Boolean).join(' ')]));
      setBookings((rows || []).map((row) => ({
        id: String(row.id),
        patientName: names.get(String(row.id_patient)) || 'Patient',
        startDate: row.start_date,
        endDate: row.end_date,
      })));
    };

    loadBookings().catch((loadError) => {
      console.error('Failed to load clinic bookings:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'We could not load clinic bookings.');
    }).finally(() => setLoading(false));
  }, [clinicId]);

  return <section><h2 className="mb-6 text-2xl font-bold">Booking Management</h2>{loading && <p className="text-muted-foreground">Loading bookings...</p>}{!loading && error && <p role="alert" className="text-destructive">{error}</p>}{!loading && !error && bookings.length === 0 && <p className="text-muted-foreground">No patient requests found for this clinic.</p>}<div className="space-y-4">{!loading && !error && bookings.map((booking) => <div key={booking.id} className="rounded-lg border border-border bg-card p-6"><div className="mb-4 flex items-start justify-between"><div><h3 className="mb-1 text-xl font-semibold">{booking.patientName}</h3><p className="text-muted-foreground">Patient request</p></div><Status /></div><div className="mb-4 grid gap-4 md:grid-cols-3"><Metric label="Start date" value={booking.startDate || 'Not specified'} /><Metric label="End date" value={booking.endDate || 'Not specified'} /><Metric label="Request ID" value={booking.id} /></div></div>)}</div></section>;
}
function Status() { return <div className="flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800"><Clock size={16} /><span>Pending</span></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div><p className="text-sm text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>; }

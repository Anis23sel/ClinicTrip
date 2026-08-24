import { Edit, Plus, Trash2 } from 'lucide-react';

const doctors = [
  { id: 1, name: 'Dr. Mehmet Yilmaz', specialization: 'Plastic & Reconstructive Surgery', experience: '18 years of experience', procedures: ['Rhinoplasty', 'Facelift', 'Body Contouring'] },
  { id: 2, name: 'Dr. Ayse Demir', specialization: 'Hair Restoration Specialist', experience: '12 years of experience', procedures: ['FUE', 'DHI', 'Sapphire FUE'] },
];

export default function ClinicDoctors() {
  return <DashboardList title="Doctors" action="Add Doctor"><div className="space-y-4">{doctors.map((doctor) => <div key={doctor.id} className="rounded-lg border border-border bg-card p-6"><div className="flex items-start gap-4"><div className="h-20 w-20 shrink-0 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10" /><div className="min-w-0 flex-1"><div className="mb-2 flex items-start justify-between"><div><h3 className="text-xl font-semibold">{doctor.name}</h3><p className="text-primary">{doctor.specialization}</p></div><Actions /></div><p className="mb-3 text-sm text-muted-foreground">{doctor.experience}</p><div className="flex flex-wrap gap-2">{doctor.procedures.map((procedure) => <span key={procedure} className="rounded bg-secondary/20 px-2 py-1 text-sm">{procedure}</span>)}</div></div></div></div>)}</div></DashboardList>;
}

export function DashboardList({ title, action, onAction, children }: { title: string; action: string; onAction?: () => void; children: React.ReactNode }) { return <section><div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-bold">{title}</h2><button type="button" onClick={onAction} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-opacity hover:opacity-90"><Plus size={20} />{action}</button></div>{children}</section>; }
function Actions() { return <div className="flex gap-2"><button aria-label="Edit doctor" className="rounded-lg p-2 transition-colors hover:bg-accent"><Edit size={18} /></button><button aria-label="Delete doctor" className="rounded-lg p-2 text-destructive transition-colors hover:bg-destructive/10"><Trash2 size={18} /></button></div>; }
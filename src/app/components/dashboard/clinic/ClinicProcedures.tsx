import { Edit, Plus, Trash2 } from 'lucide-react';
import { DashboardList } from './ClinicDoctors';

const procedures = [
  { id: 1, name: 'Rhinoplasty', category: 'Plastic Surgery', price: 2500, duration: '2-3 hours', recovery: '7-10 days' },
  { id: 2, name: 'Hair Transplant (FUE)', category: 'Hair Restoration', price: 1800, duration: '6-8 hours', recovery: '3-5 days' },
  { id: 3, name: 'Breast Augmentation', category: 'Plastic Surgery', price: 3200, duration: '1-2 hours', recovery: '1-2 weeks' },
];

export default function ClinicProcedures() { return <DashboardList title="Procedures" action="Add Procedure"><div className="space-y-4">{procedures.map((procedure) => <div key={procedure.id} className="rounded-lg border border-border bg-card p-6"><div className="mb-4 flex items-start justify-between"><div><h3 className="mb-1 text-xl font-semibold">{procedure.name}</h3><p className="text-sm text-muted-foreground">{procedure.category}</p></div><div className="flex gap-2"><button aria-label="Edit procedure" className="rounded-lg p-2 hover:bg-accent"><Edit size={18} /></button><button aria-label="Delete procedure" className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 size={18} /></button></div></div><div className="grid gap-4 md:grid-cols-3"><Metric label="Price" value={`$${procedure.price.toLocaleString()}`} primary /><Metric label="Duration" value={procedure.duration} /><Metric label="Recovery Time" value={procedure.recovery} /></div></div>)}</div></DashboardList>; }
function Metric({ label, value, primary = false }: { label: string; value: string; primary?: boolean }) { return <div><p className="text-sm text-muted-foreground">{label}</p><p className={`${primary ? 'text-lg text-primary' : ''} font-semibold`}>{value}</p></div>; }